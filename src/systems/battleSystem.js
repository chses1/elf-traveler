import { gameConfig } from "../data/gameConfig.js?v=302";

const bossCountdownMax = 3;
const buffEffectTurns = 6;
const skillAttackBoost = 2.1;
const allAttackSpreadMultiplier = 1;

export function getEnergyReward(question, isCorrect, correctStreak) {
  return isCorrect ? 1 : 0;
}

export function canUseSkill(spirit, skill) {
  return spirit.energy >= getSkillEnergyCost(skill);
}

export function createBattleState(enemySpirits, questionPool, heroStats = gameConfig.playerBaseStats) {
  const enemies = (Array.isArray(enemySpirits) ? enemySpirits : [enemySpirits])
    .filter(Boolean)
    .map((spirit, index) => createEnemy(spirit, index));
  const questions = shuffleQuestions(questionPool);
  const firstQuestion = questions[0] ?? null;
  const firstEnemy = getActiveEnemy({ enemies }) ?? enemies[0] ?? null;
  const heroes = createHeroes(heroStats);

  return {
    phase: firstQuestion && firstEnemy ? "question" : "finished",
    result: firstQuestion && firstEnemy ? null : "no-questions",
    hero: getPartyAggregate(heroes),
    heroes,
    enemies,
    enemy: firstEnemy,
    questions,
    currentQuestionIndex: 0,
    correctStreak: 0,
    bossCountdown: bossCountdownMax,
    bossCountdownMax,
    maxRounds: null,
    turn: 1,
    usedSkillHeroIds: [],
    lastMessage: firstQuestion && firstEnemy
      ? `${enemies.map((enemy) => enemy.name).join("、")} 擋住去路！回答問題來累積能量。`
      : "這個地區還沒有題目，暫時無法挑戰。",
    lastExplanation: "",
    selectedAnswer: "",
  };
}

export function getCurrentQuestion(battleState) {
  return battleState.questions[battleState.currentQuestionIndex] ?? null;
}

export function answerQuestion(battleState, answer) {
  if (battleState.phase !== "question") return battleState;

  const question = getCurrentQuestion(battleState);
  if (!question) return { ...battleState, phase: "finished", result: "no-questions" };

  const isCorrect = answer === question.answer;
  const nextStreak = isCorrect ? battleState.correctStreak + 1 : 0;
  const energyReward = getEnergyReward(question, isCorrect, nextStreak);
  const heroesWithEnergy = getHeroes(battleState).map((hero) => ({
    ...hero,
    energy: hero.hp > 0 ? Math.min(hero.maxEnergy, hero.energy + energyReward) : hero.energy,
  }));
  const enemiesWithCountdown = battleState.enemies.map((enemy) => ({
    ...enemy,
    countdown: enemy.hp > 0 ? enemy.countdown - 1 : enemy.countdown,
  }));
  const shouldBossAct = enemiesWithCountdown.some((enemy) => enemy.hp > 0 && enemy.countdown <= 0);
  const bossAction = shouldBossAct
    ? resolveBossActions({
        ...battleState,
        heroes: heroesWithEnergy,
        hero: getPartyAggregate(heroesWithEnergy),
        enemies: enemiesWithCountdown,
      })
    : { heroes: heroesWithEnergy, enemies: enemiesWithCountdown, message: "" };
  const nextHeroes = bossAction.heroes.map((hero) => ({
    ...hero,
    damageBuffTurns: Math.max(0, (hero.damageBuffTurns ?? 0) - 1),
    damageReductionTurns: Math.max(0, (hero.damageReductionTurns ?? 0) - 1),
  }));

  return finishBattleStep(syncActiveEnemy({
    ...battleState,
    phase: "action",
    heroes: nextHeroes,
    hero: getPartyAggregate(nextHeroes),
    enemies: bossAction.enemies,
    bossCountdown: getNextBossCountdown(bossAction.enemies),
    correctStreak: nextStreak,
    usedSkillHeroIds: [],
    lastMessage: isCorrect
      ? `答對了！獲得 ${energyReward} 點能量。${bossAction.message}`
      : `答錯了，沒有獲得能量。${bossAction.message}`,
    lastExplanation: question.explanation,
    selectedAnswer: answer,
    answeredCorrectly: isCorrect,
  }));
}

export function goToNextQuestion(battleState) {
  if (battleState.phase !== "action" && battleState.phase !== "review") return battleState;

  const nextQuestionIndex = (battleState.currentQuestionIndex + 1) % battleState.questions.length;

  return {
    ...battleState,
    phase: "question",
    currentQuestionIndex: nextQuestionIndex,
    turn: battleState.turn + 1,
    lastMessage: "下一題來了，穩住節奏。",
    lastExplanation: "",
    selectedAnswer: "",
    answeredCorrectly: null,
    usedSkillHeroIds: [],
  };
}

export function useBasicAttack(battleState, actorName = "小中") {
  if (battleState.phase !== "action") return battleState;

  const activeEnemy = getActiveEnemy(battleState);
  if (!activeEnemy) return finishBattleStep(syncActiveEnemy(battleState));

  const actor = getFrontHero(battleState) ?? getAliveHeroes(battleState)[0] ?? battleState.hero;

  if (!battleState.answeredCorrectly) {
    const enemyDamage = calculateReducedDamage(activeEnemy.attack, actor);
    const heroes = updateHero(getHeroes(battleState), actor.id, (hero) => ({
      ...hero,
      hp: Math.max(0, hero.hp - enemyDamage),
    }));

    return finishBattleStep(syncActiveEnemy({
      ...battleState,
      phase: "review",
      heroes,
      hero: getPartyAggregate(heroes),
      lastMessage: `${actorName} 採取防守，${activeEnemy.name} 的單體反擊由前鋒承受，造成 ${enemyDamage} 點傷害。`,
    }));
  }

  const damage = calculateDamage(actor.attack, activeEnemy.defense);
  const enemies = updateEnemy(battleState.enemies, activeEnemy.id, (enemy) => ({
    ...enemy,
    hp: Math.max(0, enemy.hp - damage),
  }));

  return finishBattleStep(syncActiveEnemy({
    ...battleState,
    phase: "review",
    enemies,
    lastMessage: `${actorName} 發動普通攻擊，造成 ${damage} 點傷害。`,
  }));
}

export function useUltimate(battleState, skill, actorName = "", actorId = "") {
  return useSkillAttack(battleState, skill, actorName, actorId);
}

export function useSkillAttack(battleState, skill, actorName = "", actorId = "") {
  const heroes = getHeroes(battleState);
  const actor = heroes.find((hero) => hero.id === actorId) ?? heroes.find((hero) => hero.name === actorName) ?? getFrontHero(battleState);
  if (
    battleState.phase !== "action"
    || !actor
    || actor.hp <= 0
    || actor.energy < getSkillEnergyCost(skill)
  ) {
    return battleState;
  }

  const skillOwner = actorName ? `${actorName} ` : "";
  let nextHeroes = updateHero(heroes, actor.id, (hero) => ({
    ...hero,
    energy: hero.energy - getSkillEnergyCost(skill),
  }));
  let nextActor = nextHeroes.find((hero) => hero.id === actor.id) ?? actor;
  let nextEnemies = [...battleState.enemies];
  let resultMessage = skill.battleText ?? `${skillOwner}使出 ${skill.name}！`;

  if (skill.skillType === "single_attack" || skill.type === "ultimate") {
    const activeEnemy = getActiveEnemy(battleState);
    if (activeEnemy) {
      const damage = calculateSkillDamage(nextActor, activeEnemy, skill);
      nextEnemies = updateEnemy(nextEnemies, activeEnemy.id, (enemy) => ({
        ...enemy,
        hp: Math.max(0, enemy.hp - damage),
      }));
      resultMessage = `${resultMessage} 對 ${activeEnemy.name} 造成 ${damage} 點傷害。`;
    }
  } else if (skill.skillType === "all_attack") {
    const damages = [];
    nextEnemies = nextEnemies.map((enemy) => {
      if (enemy.hp <= 0) return enemy;
      const damage = calculateSkillDamage(nextActor, enemy, skill, allAttackSpreadMultiplier);
      damages.push(damage);
      return { ...enemy, hp: Math.max(0, enemy.hp - damage) };
    });
    resultMessage = `${resultMessage} 掃過全體 Boss，共造成 ${damages.reduce((sum, damage) => sum + damage, 0)} 點傷害。`;
  } else if (skill.skillType === "attack_heal") {
    const activeEnemy = getActiveEnemy(battleState);
    if (activeEnemy) {
      const damage = calculateSkillDamage(nextActor, activeEnemy, skill);
      nextEnemies = updateEnemy(nextEnemies, activeEnemy.id, (enemy) => ({
        ...enemy,
        hp: Math.max(0, enemy.hp - damage),
      }));
      const healMultiplier = skill.effect?.healMultiplier ?? 0.75;
      const heal = Math.max(6, Math.round(nextActor.attack * healMultiplier));
      const frontHero = getFrontHero({ ...battleState, heroes: nextHeroes });
      nextHeroes = frontHero
        ? updateHero(nextHeroes, frontHero.id, (hero) => ({ ...hero, hp: Math.min(hero.maxHp, hero.hp + heal) }))
        : nextHeroes;
      resultMessage = `${resultMessage} 對 ${activeEnemy.name} 造成 ${damage} 點傷害，前位角色回復 ${heal} 點 HP。`;
    }
  } else if (skill.skillType === "single_heal" || skill.skillType === "all_heal") {
    const healMultiplier = skill.effect?.healMultiplier ?? 1;
    const heal = Math.max(8, Math.round(nextActor.attack * healMultiplier));
    if (skill.skillType === "all_heal") {
      nextHeroes = nextHeroes.map((hero) => (
        hero.hp > 0 ? { ...hero, hp: Math.min(hero.maxHp, hero.hp + heal) } : hero
      ));
      resultMessage = `${resultMessage} 全隊回復 ${heal} 點 HP。`;
    } else {
      const frontHero = getFrontHero({ ...battleState, heroes: nextHeroes });
      nextHeroes = frontHero
        ? updateHero(nextHeroes, frontHero.id, (hero) => ({ ...hero, hp: Math.min(hero.maxHp, hero.hp + heal) }))
        : nextHeroes;
      resultMessage = `${resultMessage} 前位角色回復 ${heal} 點 HP。`;
    }
  } else if (skill.skillType === "buff_damage") {
    const turns = skill.effect?.turns ?? buffEffectTurns;
    nextHeroes = nextHeroes.map((hero) => hero.hp > 0 ? ({
      ...hero,
      damageMultiplier: 1 + (skill.effect?.value ?? 0.2),
      damageBuffTurns: turns,
    }) : hero);
    resultMessage = `${resultMessage} 全隊接下來 ${turns} 回合攻擊提升。`;
  } else if (skill.skillType === "buff_reduce_damage") {
    const turns = skill.effect?.turns ?? buffEffectTurns;
    nextHeroes = nextHeroes.map((hero) => hero.hp > 0 ? ({
      ...hero,
      damageReduction: skill.effect?.value ?? 0.2,
      damageReductionTurns: turns,
    }) : hero);
    resultMessage = `${resultMessage} 全隊接下來 ${turns} 回合受到傷害降低。`;
  }

  const hasMoreReadySkills = hasReadySkillHero(nextHeroes);
  const nextPhase = hasMoreReadySkills ? "action" : "review";

  return finishBattleStep(syncActiveEnemy({
    ...battleState,
    phase: nextPhase,
    heroes: nextHeroes,
    hero: getPartyAggregate(nextHeroes),
    enemies: nextEnemies,
    usedSkillHeroIds: [],
    lastMessage: hasMoreReadySkills
      ? `${resultMessage} 能量足夠的夥伴還可以接著出招。`
      : resultMessage,
    lastExplanation: skill.description,
    selectedAnswer: "",
  }));
}

function createEnemy(spirit, index) {
  const pressureBoost = 1 + index * 0.08;
  const speed = spirit.stats.speed ?? 10;
  const countdownMax = getEnemyCountdownMax(speed);
  return {
    id: `${spirit.id}_${index}`,
    spiritId: spirit.id,
    districtId: spirit.districtId,
    name: spirit.name,
    hp: Math.round(spirit.stats.maxHp * pressureBoost),
    maxHp: Math.round(spirit.stats.maxHp * pressureBoost),
    attack: Math.round(spirit.stats.attack * pressureBoost),
    defense: Math.round(spirit.stats.defense * pressureBoost),
    speed,
    countdown: countdownMax,
    countdownMax,
    energy: 0,
    maxEnergy: gameConfig.maxEnergy,
  };
}

function shuffleQuestions(questionPool) {
  return shuffleArray(questionPool).map((question) => ({
    ...question,
    options: shuffleArray(question.options ?? []),
  }));
}

function shuffleArray(items = []) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[index]];
  }
  return shuffled;
}

function getEnemyCountdownMax(speed = 10) {
  if (speed >= 16) return 2;
  if (speed >= 11) return 3;
  return 4;
}

function getNextBossCountdown(enemies) {
  const aliveCountdowns = enemies
    .filter((enemy) => enemy.hp > 0)
    .map((enemy) => enemy.countdown);
  return aliveCountdowns.length ? Math.min(...aliveCountdowns) : 0;
}

function createHeroes(heroStats) {
  const heroes = (Array.isArray(heroStats) ? heroStats : [heroStats])
    .filter(Boolean)
    .map((stats, index) => ({
      ...stats,
      id: stats.id ?? `hero_${index}`,
      name: stats.name ?? "旅人",
      hp: stats.maxHp,
      energy: 0,
      maxEnergy: stats.maxEnergy ?? gameConfig.maxEnergy,
      positionIndex: index,
    }));

  return heroes.length ? heroes : createHeroes([gameConfig.playerBaseStats]);
}

function getHeroes(battleState) {
  return battleState.heroes?.length ? battleState.heroes : [battleState.hero];
}

function getAliveHeroes(battleState) {
  return getHeroes(battleState).filter((hero) => hero.hp > 0);
}

function getFrontHero(battleState) {
  return [...getAliveHeroes(battleState)].sort((a, b) => (b.positionIndex ?? 0) - (a.positionIndex ?? 0))[0] ?? null;
}

function hasReadySkillHero(heroes) {
  return heroes.some((hero) => (
    hero.hp > 0
    && (hero.skills ?? []).some((skill) => hero.energy >= getSkillEnergyCost(skill))
  ));
}

function getSkillEnergyCost(skill) {
  return Math.max(2, skill.energyCost ?? 2);
}

function updateHero(heroes, heroId, updater) {
  return heroes.map((hero) => hero.id === heroId ? updater(hero) : hero);
}

function getPartyAggregate(heroes) {
  const aliveHeroes = heroes.filter((hero) => hero.hp > 0);
  const activeHeroes = aliveHeroes.length ? aliveHeroes : heroes;
  const maxHp = heroes.reduce((sum, hero) => sum + hero.maxHp, 0);
  const hp = heroes.reduce((sum, hero) => sum + hero.hp, 0);
  const average = (key) => Math.round(activeHeroes.reduce((sum, hero) => sum + (hero[key] ?? 0), 0) / activeHeroes.length);

  return {
    ...activeHeroes[0],
    hp,
    maxHp,
    attack: average("attack"),
    defense: average("defense"),
    speed: average("speed"),
    energy: Math.max(...heroes.map((hero) => hero.energy ?? 0)),
    maxEnergy: gameConfig.maxEnergy,
  };
}

function calculateSkillDamage(hero, enemy, skill, spreadMultiplier = 1) {
  const damageBuff = hero.damageBuffTurns > 0 ? hero.damageMultiplier : 1;
  const skillMultiplier = skill.effect?.damageMultiplier ?? 2.25;
  return calculateDamage(hero.attack, enemy.defense, skillMultiplier * damageBuff * spreadMultiplier * skillAttackBoost);
}

function calculateReducedDamage(attack, hero, multiplier = 1) {
  const damageReduction = hero.damageReductionTurns > 0 ? hero.damageReduction : 0;
  return Math.max(1, Math.round(calculateDamage(attack, hero.defense, multiplier) * (1 - damageReduction)));
}

function resolveBossActions(battleState) {
  let heroes = getHeroes(battleState);
  let enemies = [...battleState.enemies];
  const messages = [];

  enemies.forEach((enemy, index) => {
    if (enemy.hp <= 0 || enemy.countdown > 0) return;

    const shouldHeal = enemy.hp <= enemy.maxHp * 0.45 && (battleState.turn + index) % 3 === 0;
    if (shouldHeal) {
      const heal = Math.max(12, Math.round(enemy.maxHp * 0.18));
      enemies = updateEnemy(enemies, enemy.id, (target) => ({
        ...target,
        hp: Math.min(target.maxHp, target.hp + heal),
        countdown: target.countdownMax,
      }));
      messages.push(`${enemy.name} 祈願回復 ${heal} HP`);
      return;
    }

    const isAllAttack = (battleState.turn + index) % 2 === 0;
    const multiplier = isAllAttack ? 0.82 : 1;
    let totalDamage = 0;
    if (isAllAttack) {
      heroes = heroes.map((hero) => {
        if (hero.hp <= 0) return hero;
        const damage = calculateReducedDamage(enemy.attack, hero, multiplier);
        totalDamage += damage;
        return { ...hero, hp: Math.max(0, hero.hp - damage) };
      });
    } else {
      const target = getFrontHero({ ...battleState, heroes });
      const damage = target ? calculateReducedDamage(enemy.attack, target, multiplier) : 0;
      totalDamage = damage;
      heroes = target
        ? updateHero(heroes, target.id, (hero) => ({ ...hero, hp: Math.max(0, hero.hp - damage) }))
        : heroes;
    }
    messages.push(`${enemy.name}${isAllAttack ? "發動全體衝擊" : "攻擊前鋒"}造成 ${totalDamage} 傷害`);
    enemies = updateEnemy(enemies, enemy.id, (target) => ({
      ...target,
      countdown: target.countdownMax,
    }));
  });

  return {
    hero: getPartyAggregate(heroes),
    heroes,
    enemies,
    message: messages.length ? ` Boss 倒數歸零，${messages.join("；")}。` : "",
  };
}

function calculateDamage(attack, defense, multiplier = 1) {
  return Math.max(6, Math.round((attack * multiplier) - defense * 0.45));
}

function getAliveEnemies(battleState) {
  return (battleState.enemies ?? []).filter((enemy) => enemy.hp > 0);
}

function getActiveEnemy(battleState) {
  return getAliveEnemies(battleState)[0] ?? null;
}

function updateEnemy(enemies, enemyId, updater) {
  return enemies.map((enemy) => enemy.id === enemyId ? updater(enemy) : enemy);
}

function syncActiveEnemy(battleState) {
  return {
    ...battleState,
    enemy: getActiveEnemy(battleState) ?? battleState.enemies?.[0] ?? battleState.enemy,
  };
}

function finishBattleStep(battleState) {
  if (getAliveEnemies(battleState).length === 0) {
    const bossNames = (battleState.enemies ?? []).map((enemy) => enemy.name).join("、");
    return syncActiveEnemy({
      ...battleState,
      phase: "finished",
      result: "win",
      lastMessage: `挑戰成功！${bossNames} 被你們擊退，守護精靈願意成為夥伴。`,
    });
  }

  if (getAliveHeroes(battleState).length === 0) {
    return syncActiveEnemy({
      ...battleState,
      phase: "finished",
      result: "lose",
      lastMessage: "隊伍體力歸零，這次挑戰失敗了。",
    });
  }

  return syncActiveEnemy(battleState);
}
