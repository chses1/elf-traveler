import { districts } from "./data/districts.js?v=400";
import { spirits } from "./data/spirits.js?v=400";
import { gameConfig } from "./data/gameConfig.js?v=302";
import { characterSkills } from "./data/characterSkills.js?v=405";
import { characterIntroductions } from "./data/characterIntroductions.js?v=401";
import { questions } from "./data/questions.js?v=401";
import {
  answerQuestion,
  createBattleState,
  getCurrentQuestion,
  goToNextQuestion,
  useUltimate,
} from "./systems/battleSystem.js?v=406";
import { loadProgress, loginProgress, logoutProgress, saveProgress } from "./systems/progressStorage.js?v=403";

const app = document.querySelector("#app");
const zhuyinToggleButton = document.querySelector("[data-zhuyin-toggle]");

const orderedDistricts = [...districts].sort((a, b) => a.order - b.order);
const districtOrderById = new Map(orderedDistricts.map((district) => [district.id, district.order]));
const orderedSpirits = [...spirits].sort((a, b) => {
  return (districtOrderById.get(a.districtId) ?? 99) - (districtOrderById.get(b.districtId) ?? 99);
});
const playerSkillSet = characterSkills.find((character) => character.id === "player_male");
const playerGirlSkillSet = characterSkills.find((character) => character.id === "player_female");
const playerDisplayNames = {
  player_boy: "小中",
  player_girl: "小珊",
};
const playerIntroductionId = {
  player_boy: "player_male",
  player_girl: "player_female",
};
const introductionById = new Map(characterIntroductions.map((entry) => [entry.id, entry]));
const spiritIntroductionByDistrictId = new Map(
  characterIntroductions
    .filter((entry) => entry.type === "spirit" && entry.districtId)
    .map((entry) => [entry.districtId, entry]),
);
const skillSetByDistrictId = new Map(
  characterSkills
    .filter((character) => character.districtId)
    .map((character) => [character.districtId, character]),
);
const skillTierLevel = { low: 1, mid: 2, high: 3 };
const defaultPlayerAvatar = "boy";
const teamPositions = [
  { id: "back", label: "後", hint: "後衛" },
  { id: "middle", label: "中", hint: "中衛" },
  { id: "front", label: "前", hint: "前鋒" },
];
const finalBattleId = "final_boss";
const teacherAccountId = "00000";
const resultScreenImages = {
  win: "img/win.jpeg",
  lose: "img/lose.jpeg",
};
const finalBossSpirit = {
  id: "mist_king",
  districtId: "final",
  district: "迷霧之城",
  name: "迷霧魔王",
  elements: ["霧", "遺忘"],
  role: "最終魔王",
  features: ["地方記憶", "十三區試煉", "最終挑戰"],
  stats: { hp: 320, maxHp: 320, attack: 35, defense: 18, speed: 13, energy: 0, maxEnergy: 6, level: 3, exp: 0 },
};
const finalBossDistrict = {
  id: finalBattleId,
  code: "14",
  name: "迷霧之城",
  difficulty: "最終",
  order: 14,
  description: "十三區記憶匯聚後，迷霧魔王現身阻擋桃花園地圖完全點亮。",
};
let activeBattle = null;
let activeBattleDistrictId = "";
let activeBattleTeam = [null, null, null];
let activeSkillMemberId = "";
let activePokedexCharacterId = "player_boy";
let activeShrineCharacterId = "";
let isLoginPanelOpen = false;
let isZhuyinEnabled = false;
let fullscreenMessage = "";
let isFullscreenButtonHidden = false;

function renderZhuyinToggle() {
  if (!zhuyinToggleButton) return;
  zhuyinToggleButton.textContent = `注音字體：${isZhuyinEnabled ? "開" : "關"}`;
  zhuyinToggleButton.setAttribute("aria-pressed", String(isZhuyinEnabled));
}

function setZhuyinEnabled(isEnabled) {
  isZhuyinEnabled = isEnabled;
  document.body.classList.toggle("is-zhuyin-enabled", isZhuyinEnabled);
  renderZhuyinToggle();
}

zhuyinToggleButton?.addEventListener("click", () => {
  setZhuyinEnabled(!isZhuyinEnabled);
});

const districtHotspots = {
  taoyuan: { left: 51.1, top: 25.5 },
  guishan: { left: 61.2, top: 21.1 },
  luzhu: { left: 51, top: 11.1 },
  dayuan: { left: 38.3, top: 10.5 },
  guanyin: { left: 23.1, top: 20 },
  xinwu: { left: 14.7, top: 32.3 },
  zhongli: { left: 39.1, top: 28.1 },
  bade: { left: 51.5, top: 40.3 },
  pingzhen: { left: 38.1, top: 48.4 },
  yangmei: { left: 24.5, top: 45.9 },
  longtan: { left: 37.5, top: 66.1 },
  daxi: { left: 51.5, top: 53 },
  fuxing: { left: 63.6, top: 75.8 },
};

const bossImageByDistrictId = {
  taoyuan: "img/boss01.webp",
  zhongli: "img/boss02.webp",
  guishan: "img/boss03.webp",
  luzhu: "img/boss04.webp",
  dayuan: "img/boss05.webp",
  guanyin: "img/boss06.webp",
  xinwu: "img/boss07.webp",
  bade: "img/boss08.webp",
  pingzhen: "img/boss09.webp",
  yangmei: "img/boss10.webp",
  longtan: "img/boss11.webp",
  daxi: "img/boss12.webp",
  fuxing: "img/boss13.webp",
};

function getDistrictBundle(districtId) {
  if (districtId === finalBattleId) {
    return {
      district: finalBossDistrict,
      spirit: finalBossSpirit,
      districtQuestions: getFinalQuestionPool(),
    };
  }

  const district = districts.find((item) => item.id === districtId);
  const spirit = spirits.find((item) => item.districtId === districtId);
  const districtQuestions = questions.filter((item) => item.districtId === districtId);

  return { district, spirit, districtQuestions };
}

function getFinalQuestionPool() {
  return orderedDistricts.flatMap((district) => {
    return questions
      .filter((question) => question.districtId === district.id)
      .slice(0, 2);
  });
}

function getCharacterLevel(characterId, progress = loadProgress()) {
  return Math.min(3, Math.max(1, progress.characterLevels?.[characterId] ?? 1));
}

function getSelectedPlayerId(progress = loadProgress()) {
  return progress.selectedPlayerId === "player_girl" ? "player_girl" : "player_boy";
}

function getSelectedPlayerSkillSet(playerId = getSelectedPlayerId()) {
  return playerId === "player_girl" ? playerGirlSkillSet : playerSkillSet;
}

function getTeacherProgressPatch(selectedPlayerId) {
  return {
    coins: 100000,
    ownedSpiritIds: orderedSpirits.map((spirit) => spirit.id),
    pokedexUnlockedIds: orderedSpirits.map((spirit) => spirit.id),
    completedDistrictIds: orderedDistricts.map((district) => district.id),
    finalBossDefeated: false,
    currentTeam: [selectedPlayerId],
    characterLevels: {
      player_boy: 1,
      player_girl: 1,
      ...Object.fromEntries(orderedSpirits.map((spirit) => [spirit.id, 1])),
    },
  };
}

function getGradeByLevel(level) {
  return gameConfig.characterGrades.find((grade) => grade.level === level)
    ?? gameConfig.characterGrades[0];
}

function getCharacterSkills(skillSet, level) {
  return (skillSet?.skills ?? []).filter((skill, index) => {
    const requiredLevel = skillTierLevel[skill.tier] ?? index + 1;
    return requiredLevel <= level;
  });
}

function getNextBlessingCost(character, level) {
  const nextLevel = level + 1;
  const isSpirit = character?.type === "spirit";
  const baseCosts = isSpirit ? gameConfig.spiritBlessingCosts : gameConfig.playerBlessingCosts;
  const baseCost = baseCosts?.[nextLevel] ?? null;
  if (!Number.isFinite(baseCost)) return null;

  if (!isSpirit) return baseCost;

  const districtOrder = districtOrderById.get(character.spirit?.districtId) ?? 1;
  const growth = gameConfig.spiritBlessingCostGrowth?.[nextLevel] ?? 0;
  return baseCost + Math.max(0, districtOrder - 1) * growth;
}

function getCharacterBaseStats(member) {
  if (member?.type === "spirit") return getProgressiveSpiritBaseStats(member.spirit);
  return gameConfig.playerBaseStats;
}

function calculateStatsFromLevel(baseStats, level) {
  const growthSteps = level - 1;
  const growthMultiplier = baseStats.levelGrowthMultiplier ?? 1;
  return {
    maxHp: Math.round(baseStats.maxHp + gameConfig.levelUpGrowth.maxHp * growthSteps * growthMultiplier),
    hp: Math.round(baseStats.maxHp + gameConfig.levelUpGrowth.maxHp * growthSteps * growthMultiplier),
    attack: Math.round(baseStats.attack + gameConfig.levelUpGrowth.attack * growthSteps * growthMultiplier),
    defense: Math.round(baseStats.defense + gameConfig.levelUpGrowth.defense * growthSteps * growthMultiplier),
    speed: Math.round((baseStats.speed ?? 10) + gameConfig.levelUpGrowth.speed * growthSteps * Math.min(1.4, growthMultiplier)),
    energy: 0,
    maxEnergy: gameConfig.maxEnergy,
    level,
  };
}

function getProgressiveSpiritBaseStats(spirit) {
  const order = districtOrderById.get(spirit?.districtId) ?? 1;
  const rank = Math.max(0, order - 1);
  const multiplier = 1 + rank * 0.055;

  return {
    ...spirit.stats,
    maxHp: Math.round(spirit.stats.maxHp * multiplier + rank * 3),
    hp: Math.round(spirit.stats.maxHp * multiplier + rank * 3),
    attack: Math.round(spirit.stats.attack * (1 + rank * 0.04)),
    defense: Math.round(spirit.stats.defense * (1 + rank * 0.035)),
    speed: Math.round((spirit.stats.speed ?? 10) + rank * 0.18),
    maxEnergy: gameConfig.maxEnergy,
    levelGrowthMultiplier: 1 + rank * 0.035,
  };
}

function getGuardianBossSpirit(spirit) {
  const baseStats = getProgressiveSpiritBaseStats(spirit);
  const order = districtOrderById.get(spirit?.districtId) ?? 1;
  const bossLevel = order <= 1 ? 1 : 2;
  return {
    ...spirit,
    stats: {
      ...calculateStatsFromLevel(baseStats, bossLevel),
      level: bossLevel,
      exp: 0,
    },
  };
}

function getMemberStats(member, progress = loadProgress()) {
  return calculateStatsFromLevel(getCharacterBaseStats(member), getCharacterLevel(member.id, progress));
}

function getMemberElements(member) {
  if (member.type === "spirit") return member.spirit.elements;
  return member.skillSet?.element ?? ["探索", "光"];
}

function getTeamBattleStats(progress = loadProgress()) {
  const members = getBattleTeamMembers();
  const stats = members.map((member) => ({
    ...getMemberStats(member, progress),
    id: member.id,
    name: member.name,
    skills: getMemberSkills(member),
  }));
  const selectedPlayerId = getSelectedPlayerId(progress);
  return stats.length ? stats : [{
    ...calculateStatsFromLevel(gameConfig.playerBaseStats, 1),
    id: selectedPlayerId,
    name: getPlayerDisplayName(selectedPlayerId),
  }];
}

function getDistrictRewardCoins(district) {
  const order = district.order ?? 1;
  return gameConfig.battleRewards.districtBoss.coins
    + (order - 1) * gameConfig.rewardCoinGrowthPerDistrict;
}

function getBossCountForDistrict(district) {
  if ((district.order ?? 1) <= 2) return 1;
  if ((district.order ?? 1) === 3) return 2;
  return 3;
}

function getBossSpiritsForDistrict(district, guardianSpirit) {
  const bossCount = getBossCountForDistrict(district);
  const previousBosses = orderedSpirits.filter((spirit) => {
    const order = districtOrderById.get(spirit.districtId) ?? 99;
    return order < district.order && spirit.id !== guardianSpirit.id;
  });
  const shuffledPreviousBosses = [...previousBosses].sort(() => Math.random() - 0.5);

  return [guardianSpirit, ...shuffledPreviousBosses].slice(0, bossCount);
}

function getSpiritPowerScore(spirit) {
  const stats = getProgressiveSpiritBaseStats(spirit);
  return stats.maxHp + stats.attack * 4 + stats.defense * 3 + stats.speed * 2;
}

function getFinalBattleBossSpirits() {
  const strongestGuardians = [...orderedSpirits]
    .sort((a, b) => getSpiritPowerScore(b) - getSpiritPowerScore(a))
    .slice(0, 2)
    .map((spirit) => getGuardianBossSpirit(spirit));

  return [finalBossSpirit, ...strongestGuardians];
}

function formatDistrictName(district) {
  return `${district.code} ${district.name}`;
}

function getDistrictBackground(district) {
  return `img/map${district.code}.jpeg`;
}

function getBossImage(district) {
  return bossImageByDistrictId[district.id] ?? `img/boss${district.code}.webp`;
}

function getFinalBossImage() {
  return "img/boss14.webp";
}

function getFinalBattleBackground() {
  return "img/map14.jpeg";
}

function isTeacherProgress(progress = loadProgress()) {
  return progress.studentId === teacherAccountId;
}

function getUnlockedDistrictIds(progress = loadProgress()) {
  if (isTeacherProgress(progress)) return new Set(orderedDistricts.map((district) => district.id));

  const completedDistrictIds = new Set(progress.completedDistrictIds ?? []);
  const unlockedDistrictIds = new Set();

  for (const district of orderedDistricts) {
    unlockedDistrictIds.add(district.id);
    if (!completedDistrictIds.has(district.id)) break;
  }

  return unlockedDistrictIds;
}

function isDistrictUnlocked(districtId, progress = loadProgress()) {
  return getUnlockedDistrictIds(progress).has(districtId);
}

function getEnemyImage(enemy) {
  if (enemy.spiritId === finalBossSpirit.id || enemy.districtId === "final") return getFinalBossImage();
  const enemyDistrict = districts.find((item) => item.id === enemy.districtId);
  return enemyDistrict ? getBossImage(enemyDistrict) : "";
}

function getPlayerImage() {
  return `img/${defaultPlayerAvatar}.webp`;
}

function getPlayerAvatarImage(playerId) {
  return playerId === "player_girl" ? "img/girl.webp" : "img/boy.webp";
}

function getPlayerDisplayName(playerId) {
  return playerDisplayNames[playerId] ?? "小中";
}

function getPlayerIntroduction(playerId) {
  return introductionById.get(playerIntroductionId[playerId]) ?? null;
}

function getSpiritIntroduction(spirit) {
  return spiritIntroductionByDistrictId.get(spirit.districtId) ?? null;
}

function getGuideIntroduction() {
  return introductionById.get("taohuayuan_codex") ?? null;
}

function getFinalBossIntroduction() {
  return introductionById.get("mist_king") ?? null;
}

function getHomePlayerDialogue() {
  return [
    "先點地圖上的區域光點，進入地方挑戰。",
    "答題會累積能量，戰勝守護精靈就能解鎖圖鑑。",
    "收服精靈後，可到神社祝福，再安排隊伍挑戰下一區。",
  ];
}

function getHomeGuideDialogue(progress = loadProgress()) {
  const { district, spirit } = getCurrentChallengeBundle(progress);
  if (!district || !spirit) {
    return [
      "十三區的光都已點亮，最後的迷霧正在聚集。",
      "準備好隊伍，前往最終挑戰迎戰迷霧之王。",
      "善用高階全體技能，守住桃花園的記憶。",
    ];
  }

  const skillSet = skillSetByDistrictId.get(spirit.districtId);
  const lowSkill = skillSet?.skills?.find((skill) => skill.tier === "low") ?? skillSet?.skills?.[0];
  const highSkill = skillSet?.skills?.find((skill) => skill.tier === "high") ?? skillSet?.skills?.at(-1);
  const featureText = spirit.features.slice(0, 3).join("、");
  const skillText = [lowSkill?.name, highSkill?.name].filter(Boolean).join("、");

  return [
    `目前挑戰${district.name}，守護精靈是${spirit.name}。`,
    `${spirit.name}的線索是${featureText}。`,
    `答題集能量，善用${skillText}突破 Boss。`,
  ];
}

function getCurrentChallengeBundle(progress = loadProgress()) {
  const completedDistrictIds = new Set(progress.completedDistrictIds ?? []);
  const unlockedDistrictIds = getUnlockedDistrictIds(progress);
  const district = orderedDistricts.find((item) => (
    unlockedDistrictIds.has(item.id) && !completedDistrictIds.has(item.id)
  ));
  if (!district) return { district: null, spirit: null };
  return getDistrictBundle(district.id);
}

function getHomeGuideImage(progress = loadProgress()) {
  return "img/book.webp";
}

function getHomeGuideName(progress = loadProgress()) {
  return getGuideIntroduction()?.name ?? "桃花園圖鑑";
}

function renderLogin() {
  app.innerHTML = `
    <section class="login-screen">
      <button class="login-start-button" type="button" data-open-login>登入遊戲</button>
      ${isLoginPanelOpen ? `
        <div class="login-modal">
          <form class="login-panel" data-login-form>
            <div class="login-field">
              <label for="student-id">學號</label>
              <input
                id="student-id"
                name="studentId"
                type="text"
                inputmode="numeric"
                maxlength="5"
                pattern="[0-9]{5}"
                placeholder="輸入 5 位數字"
                required
              />
            </div>
            <fieldset class="login-character-options">
              <legend>選擇角色</legend>
              <label>
                <input type="radio" name="playerId" value="player_boy" checked />
                <img src="${getPlayerAvatarImage("player_boy")}" alt="${getPlayerDisplayName("player_boy")}" />
                <span>${getPlayerDisplayName("player_boy")}</span>
              </label>
              <label>
                <input type="radio" name="playerId" value="player_girl" />
                <img src="${getPlayerAvatarImage("player_girl")}" alt="${getPlayerDisplayName("player_girl")}" />
                <span>${getPlayerDisplayName("player_girl")}</span>
              </label>
            </fieldset>
            <p class="login-error" data-login-error aria-live="polite"></p>
            <button type="submit">進入桃花園</button>
          </form>
        </div>
      ` : ""}
    </section>
  `;
}

function renderAppStart() {
  const progress = loadProgress();
  if (!progress.isLoggedIn || !progress.studentId) {
    renderLogin();
    return;
  }

  renderHome();
}

function scrollPageToTop() {
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

function isInFullscreenMode() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement) || window.navigator.standalone === true;
}

async function requestGameFullscreen() {
  fullscreenMessage = "";
  isFullscreenButtonHidden = true;
  const requestFullscreen = document.documentElement.requestFullscreen
    ?? document.documentElement.webkitRequestFullscreen;

  try {
    if (!isInFullscreenMode() && requestFullscreen) {
      await requestFullscreen.call(document.documentElement);
    }
  } catch {
    fullscreenMessage = "";
  }

  renderHome();
}

function renderDialogueBubbles(lines = []) {
  if (!lines.length) return "";

  return `
    <div class="dialogue-bubbles" style="--bubble-count: ${lines.length};">
      ${lines.map((line, index) => `
        <p style="--bubble-index: ${index};">${line}</p>
      `).join("")}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getDialogueLines(entry) {
  const lines = [...(entry?.storyDialogue ?? [])];
  if (entry?.catchphrase && !lines.includes(entry.catchphrase)) {
    lines.push(entry.catchphrase);
  }
  return lines;
}

function truncateText(text, maxLength = 42) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function getDistrictStudyNotes(districtQuestions) {
  const notes = [];
  for (const question of districtQuestions) {
    const note = question.explanation || question.answer;
    if (note && !notes.includes(note)) notes.push(note);
    if (notes.length >= 3) break;
  }
  return notes;
}

function getDistrictStudyNote(districtQuestions) {
  const notes = getDistrictStudyNotes(districtQuestions);
  if (!notes.length) return "";
  return notes[Math.floor(Math.random() * notes.length)];
}

function getDistrictChallengeHints(districtQuestions) {
  return districtQuestions
    .map((question) => question.explanation || question.answer)
    .filter(Boolean);
}

function getDistrictFeatureIntro(district, spirit) {
  return `${district.description} 本次挑戰會聚焦在 ${spirit.features.join("、")} 等地方線索。`;
}

function getBattleOpeningMessage(guardianSpirit, bossSpirits) {
  const intro = guardianSpirit.id === finalBossSpirit.id
    ? getFinalBossIntroduction()
    : getSpiritIntroduction(guardianSpirit);
  const bossNames = bossSpirits.map((enemy) => enemy.name).join("、");
  const line = intro?.storyDialogue?.at(-1);

  return line
    ? `${bossNames} 擋住去路！${guardianSpirit.name}：「${line}」`
    : `${bossNames} 擋住去路！回答問題來累積能量。`;
}

function getSpiritImage(spirit) {
  if (spirit.id === finalBossSpirit.id) return getFinalBossImage();
  const district = districts.find((item) => item.id === spirit.districtId);
  return district ? getBossImage(district) : "";
}

function getBattleRosterCandidates() {
  const progress = loadProgress();
  const selectedPlayerId = getSelectedPlayerId(progress);
  const selectedPlayerSkillSet = getSelectedPlayerSkillSet(selectedPlayerId);
  const unlockedSpiritIds = new Set([
    ...(progress.ownedSpiritIds ?? []),
    ...(progress.pokedexUnlockedIds ?? []),
  ]);

  return [
    {
      id: selectedPlayerId,
      type: "player",
      name: getPlayerDisplayName(selectedPlayerId),
      role: "玩家角色",
      image: getPlayerAvatarImage(selectedPlayerId),
      unlocked: true,
      skillSet: selectedPlayerSkillSet,
      level: getCharacterLevel(selectedPlayerId, progress),
    },
    ...orderedSpirits.map((spirit) => ({
      id: spirit.id,
      type: "spirit",
      name: spirit.name,
      role: spirit.role,
      image: getSpiritImage(spirit),
      unlocked: unlockedSpiritIds.has(spirit.id),
      spirit,
      skillSet: skillSetByDistrictId.get(spirit.districtId),
      level: getCharacterLevel(spirit.id, progress),
    })),
  ];
}

function getSelectedBattleTeam() {
  const candidates = getBattleRosterCandidates();
  return activeBattleTeam
    .map((id) => candidates.find((candidate) => candidate.id === id))
    .map((candidate) => candidate ?? null);
}

function getBattleTeamMembers() {
  return getSelectedBattleTeam().filter(Boolean);
}

function toggleBattleTeamMember(candidateId) {
  if (activeBattleTeam.includes(candidateId)) {
    activeBattleTeam = activeBattleTeam.map((id) => id === candidateId ? null : id);
    return;
  }

  const emptySlotIndex = [2, 1, 0].find((index) => !activeBattleTeam[index]);
  if (emptySlotIndex === -1) return;
  activeBattleTeam[emptySlotIndex] = candidateId;
}

function getActiveTeamMember() {
  const selectedTeam = getSelectedBattleTeam();
  return selectedTeam[2] ?? selectedTeam[1] ?? selectedTeam[0] ?? getBattleRosterCandidates()[0];
}

function getMemberSkills(member) {
  if (!member) return [];
  return getCharacterSkills(member.skillSet, member.level ?? getCharacterLevel(member.id));
}

function getMemberSkill(member, skillId) {
  return getMemberSkills(member).find((skill) => skill.id === skillId) ?? null;
}

function getSkillEnergyCost(skill) {
  return Math.max(2, skill?.energyCost ?? 2);
}

function hasMemberReadySkill(member, actorState) {
  if (!member || !actorState || activeBattle?.phase !== "action") return false;
  if (actorState.hp <= 0) return false;
  return getMemberSkills(member).some((skill) => actorState.energy >= getSkillEnergyCost(skill));
}

function hasReadyTeamSkill() {
  return getSelectedBattleTeam().some((member) => {
    if (!member) return false;
    const actorState = activeBattle?.heroes?.find((hero) => hero.id === member.id) ?? activeBattle?.hero;
    return hasMemberReadySkill(member, actorState);
  });
}

function unlockSpiritAfterWin(spirit, district) {
  const progress = loadProgress();
  const ownedSpiritIds = new Set(progress.ownedSpiritIds ?? []);
  const pokedexUnlockedIds = new Set(progress.pokedexUnlockedIds ?? []);
  const completedDistrictIds = new Set(progress.completedDistrictIds ?? []);
  const characterLevels = { ...(progress.characterLevels ?? {}) };
  const rewardCoins = getDistrictRewardCoins(district);

  ownedSpiritIds.add(spirit.id);
  pokedexUnlockedIds.add(spirit.id);
  completedDistrictIds.add(district.id);
  if (!characterLevels[spirit.id]) characterLevels[spirit.id] = 1;

  saveProgress({
    ...progress,
    coins: (progress.coins ?? 0) + rewardCoins,
    ownedSpiritIds: [...ownedSpiritIds],
    pokedexUnlockedIds: [...pokedexUnlockedIds],
    completedDistrictIds: [...completedDistrictIds],
    characterLevels,
  });

  return rewardCoins;
}

function getDistrictSceneStyle(district) {
  if (district.id === finalBattleId) {
    return `background-image: linear-gradient(180deg, rgba(28, 20, 38, 0.2), rgba(28, 20, 38, 0.34)), url('${getFinalBattleBackground()}');`;
  }

  return `background-image: linear-gradient(180deg, rgba(255, 248, 229, 0.04), rgba(255, 248, 229, 0.1)), url('${getDistrictBackground(district)}');`;
}

function hasCompletedAllDistricts(progress = loadProgress()) {
  const completed = new Set(progress.completedDistrictIds ?? []);
  return orderedDistricts.every((district) => completed.has(district.id));
}

function renderMapHotspots() {
  const progress = loadProgress();
  const unlockedDistrictIds = getUnlockedDistrictIds(progress);

  return orderedDistricts
    .map((district) => {
      const hotspot = districtHotspots[district.id];
      if (!hotspot) return "";
      const isUnlocked = unlockedDistrictIds.has(district.id);

      return `
        <button
          class="map-hotspot ${isUnlocked ? "is-unlocked" : "is-locked"}"
          type="button"
          ${isUnlocked ? `data-district-id="${district.id}"` : "disabled"}
          style="left: ${hotspot.left}%; top: ${hotspot.top}%;"
          aria-label="${isUnlocked ? formatDistrictName(district) : `${formatDistrictName(district)}尚未解鎖`}"
        >
          <span>${district.code}</span>
        </button>
      `;
    })
    .join("");
}

function renderHome() {
  const guideIntro = getGuideIntroduction();
  const progress = loadProgress();
  const selectedPlayerId = getSelectedPlayerId(progress);
  const playerIntro = getPlayerIntroduction(selectedPlayerId);
  const guideDialogue = getHomeGuideDialogue(progress);
  const guideImage = getHomeGuideImage(progress);
  const guideName = getHomeGuideName(progress);
  const playerDialogue = getHomePlayerDialogue();

  app.innerHTML = `
    <section class="main-screen">
      <button class="home-logout-button" type="button" data-logout>登出</button>
      ${isFullscreenButtonHidden ? "" : `
        <button class="home-fullscreen-button" type="button" data-fullscreen>
          ${isInFullscreenMode() ? "已全螢幕" : "全螢幕"}
        </button>
      `}
      ${fullscreenMessage ? `<p class="home-fullscreen-message" aria-live="polite">${fullscreenMessage}</p>` : ""}
      ${renderFinalBossHomeEntry(progress)}
      ${renderMapHotspots()}
      ${playerIntro ? `
        <div class="home-player-stage" aria-label="${playerIntro.name}">
          <img class="home-player-boy" src="${getPlayerAvatarImage(selectedPlayerId)}" alt="${playerIntro.name}" />
          ${renderDialogueBubbles(playerDialogue)}
        </div>
      ` : ""}
      ${guideIntro ? `
        <div class="home-guide-stage" aria-label="${guideName}">
          ${renderDialogueBubbles(guideDialogue)}
          <img class="home-guide-book" src="${guideImage}" alt="${guideName}" />
        </div>
      ` : ""}
    </section>
  `;
  scrollPageToTop();
}

function renderFinalBossHomeEntry(progress) {
  const completedCount = new Set(progress.completedDistrictIds ?? []).size;
  const isUnlocked = hasCompletedAllDistricts(progress);
  const bossIntro = getFinalBossIntroduction();
  const label = isUnlocked
    ? `${bossIntro?.name ?? finalBossSpirit.name} 已現身，點擊進入最終挑戰`
    : `最終魔王尚未現身，已完成 ${completedCount} / ${orderedDistricts.length} 區`;

  return `
    <button
      class="home-final-boss ${isUnlocked ? "is-unlocked" : "is-locked"}"
      type="button"
      ${isUnlocked ? "data-final-intro" : "disabled"}
      aria-label="${label}"
    >
      <img src="${getFinalBossImage()}" alt="${isUnlocked ? bossIntro?.name ?? finalBossSpirit.name : "最終魔王黑影"}" />
      <span>${bossIntro?.name ?? finalBossSpirit.name}</span>
    </button>
  `;
}

function renderMap() {
  app.innerHTML = `
    <nav class="topbar">
      <button type="button" data-view="home">首頁</button>
      <button type="button" data-view="pokedex">圖鑑</button>
      <button type="button" data-view="shop">神社</button>
    </nav>
    <section class="map-overview">
      <div class="interactive-map" role="img" aria-label="桃園 13 區冒險地圖">
        ${renderMapHotspots()}
      </div>
      <div class="section-heading">
        <p class="eyebrow">Taoyuan Map</p>
        <h2>直接點擊地圖上的分區</h2>
      </div>
    </section>
  `;
}

function renderDistrictIntro(districtId) {
  if (!isDistrictUnlocked(districtId)) {
    renderHome();
    return;
  }

  const { district, spirit, districtQuestions } = getDistrictBundle(districtId);
  if (!district || !spirit) {
    renderMap();
    return;
  }
  const spiritIntro = getSpiritIntroduction(spirit);
  const challengeHints = getDistrictChallengeHints(districtQuestions);

  app.innerHTML = `
    <section class="district-scene intro-scene" style="${getDistrictSceneStyle(district)}">
      <nav class="scene-nav">
        <button type="button" data-view="home">返回主畫面</button>
        <button type="button" data-view="pokedex">圖鑑</button>
        <button type="button" data-view="shop">神社</button>
      </nav>
      <article class="intro-dialog district-intro-dialog">
        <p class="intro-fixed-summary">${district.description}</p>
        <div class="intro-keyword-row">
          <span class="tag">關鍵字</span>
          <div class="feature-list">
            ${spirit.features.map((feature) => `<span>${feature}</span>`).join("")}
          </div>
        </div>
        <div class="intro-hint-row">
          <span class="tag">本區域<br>提示</span>
          <div class="intro-hint-carousel" style="--hint-count: ${challengeHints.length || 1};" aria-label="${district.name}挑戰提示">
            ${challengeHints.map((hint, index) => `
              <p class="intro-study-note" style="--hint-index: ${index};">${truncateText(hint, 64)}</p>
            `).join("") || `<p class="intro-study-note">觀察題目線索，找出最符合地方特色的答案。</p>`}
          </div>
        </div>
        <button type="button" data-battle-id="${district.id}">開始挑戰</button>
      </article>
      <div class="intro-spirit-stage" aria-hidden="true">
        <img
          class="intro-spirit"
          src="${getBossImage(district)}"
          alt=""
        />
        ${renderDialogueBubbles(getDialogueLines(spiritIntro))}
      </div>
    </section>
  `;
}

function renderFinalBossIntro() {
  const bossIntro = getFinalBossIntroduction();
  const progress = loadProgress();
  if (!hasCompletedAllDistricts(progress)) {
    renderMap();
    return;
  }

  app.innerHTML = `
    <section class="district-scene intro-scene final-boss-scene" style="${getDistrictSceneStyle(finalBossDistrict)}">
      <nav class="scene-nav">
        <button type="button" data-view="home">返回主畫面</button>
        <button type="button" data-view="pokedex">圖鑑</button>
        <button type="button" data-view="shop">神社</button>
      </nav>
      <article class="intro-dialog final-boss-dialog">
        <p class="eyebrow">Final Battle</p>
        <h2>${bossIntro?.name ?? finalBossSpirit.name}</h2>
        <h3>${bossIntro?.title ?? finalBossSpirit.role}</h3>
        <p>${bossIntro?.intro ?? finalBossDistrict.description}</p>
        <p><strong>屬性：</strong>${finalBossSpirit.elements.join(" / ")}</p>
        <p><strong>題目：</strong>十三區混合試煉 ${getFinalQuestionPool().length} 題</p>
        <button type="button" data-final-battle-id>選擇隊伍</button>
      </article>
      <div class="intro-spirit-stage" aria-hidden="true">
        <img class="intro-spirit" src="${getFinalBossImage()}" alt="" />
        ${renderDialogueBubbles(getDialogueLines(bossIntro))}
      </div>
    </section>
  `;
}

function renderBattle(districtId) {
  if (!isDistrictUnlocked(districtId)) {
    renderHome();
    return;
  }

  const { district, spirit, districtQuestions } = getDistrictBundle(districtId);
  if (!district || !spirit) {
    renderMap();
    return;
  }

  activeBattleDistrictId = districtId;
  activeSkillMemberId = "";
  const bossSpirits = getBossSpiritsForDistrict(district, spirit);
  const guardianBossSpirits = bossSpirits.map((bossSpirit) => getGuardianBossSpirit(bossSpirit));
  activeBattle = createBattleState(
    guardianBossSpirits,
    districtQuestions,
    getTeamBattleStats(),
  );
  if (activeBattle.phase === "question") {
    activeBattle = {
      ...activeBattle,
      lastMessage: getBattleOpeningMessage(spirit, guardianBossSpirits),
    };
  }
  renderBattleState();
}

function renderFinalBattle() {
  const progress = loadProgress();
  if (!hasCompletedAllDistricts(progress)) {
    renderMap();
    return;
  }

  activeBattleDistrictId = finalBattleId;
  activeSkillMemberId = "";
  const finalBattleBossSpirits = getFinalBattleBossSpirits();
  activeBattle = createBattleState(
    finalBattleBossSpirits,
    getFinalQuestionPool(),
    getTeamBattleStats(),
  );
  if (activeBattle.phase === "question") {
    activeBattle = {
      ...activeBattle,
      lastMessage: getBattleOpeningMessage(finalBossSpirit, finalBattleBossSpirits),
    };
  }
  renderBattleState();
}

function renderBattleTeamSelect(districtId) {
  if (!isDistrictUnlocked(districtId)) {
    renderHome();
    return;
  }

  const { district, spirit } = getDistrictBundle(districtId);
  if (!district || !spirit) {
    renderMap();
    return;
  }

  activeBattleDistrictId = districtId;
  activeBattle = null;

  const candidates = getBattleRosterCandidates();
  const selectedCandidates = getSelectedBattleTeam();
  const selectedCount = getBattleTeamMembers().length;
  app.innerHTML = `
    <section class="district-scene team-select-scene" style="${getDistrictSceneStyle(district)}">
      <nav class="scene-nav">
        <button type="button" data-district-id="${district.id}">返回介紹</button>
        <button type="button" data-view="home">主畫面</button>
        <button type="button" data-view="pokedex">圖鑑</button>
      </nav>
      <div class="team-preview-field">
        ${[0, 1, 2].map((index) => renderTeamPreviewSlot(selectedCandidates[index], index)).join("")}
      </div>
      <aside class="team-select-panel">
        <h2>選擇上場角色</h2>
        <div class="roster-grid">
          ${candidates.map((candidate) => renderRosterCard(candidate)).join("")}
        </div>
        <div class="team-select-actions">
          <span>${selectedCount} / 3</span>
          <button type="button" data-start-battle="${district.id}" ${selectedCount > 0 ? "" : "disabled"}>開始戰鬥</button>
        </div>
      </aside>
    </section>
  `;
}

function renderFinalBattleTeamSelect() {
  activeBattleDistrictId = finalBattleId;
  activeBattle = null;

  const candidates = getBattleRosterCandidates();
  const selectedCandidates = getSelectedBattleTeam();
  const selectedCount = getBattleTeamMembers().length;

  app.innerHTML = `
    <section class="district-scene team-select-scene final-boss-scene" style="${getDistrictSceneStyle(finalBossDistrict)}">
      <nav class="scene-nav">
        <button type="button" data-final-intro>返回魔王</button>
        <button type="button" data-view="home">主畫面</button>
        <button type="button" data-view="pokedex">圖鑑</button>
      </nav>
      <div class="team-preview-field">
        ${[0, 1, 2].map((index) => renderTeamPreviewSlot(selectedCandidates[index], index)).join("")}
      </div>
      <aside class="team-select-panel">
        <h2>選擇上場角色</h2>
        <div class="roster-grid">
          ${candidates.map((candidate) => renderRosterCard(candidate)).join("")}
        </div>
        <div class="team-select-actions">
          <span>${selectedCount} / 3</span>
          <button type="button" data-start-final-battle ${selectedCount > 0 ? "" : "disabled"}>開始魔王戰</button>
        </div>
      </aside>
    </section>
  `;
}

function renderTeamPreviewSlot(member, index) {
  const position = teamPositions[index];
  const slotClass = `team-preview-slot team-preview-slot-${index + 1}`;
  if (!member) {
    return `
      <div class="${slotClass} is-empty">
        <div class="team-platform"></div>
        <div class="team-preview-name">${position.label}</div>
      </div>
    `;
  }

  return `
    <div class="${slotClass}">
      <div class="team-platform"></div>
      <img class="team-preview-image" src="${member.image}" alt="${member.name}" />
      <div class="team-preview-name">${position.label}｜${member.name}</div>
    </div>
  `;
}

function renderSelectedTeamChip(member, index) {
  const position = teamPositions[index];
  if (!member) {
    return `<div class="selected-team-chip is-empty"><strong>${position.label}</strong><span>${position.hint}</span></div>`;
  }

  return `
    <div class="selected-team-chip">
      <button class="slot-remove-button" type="button" data-team-remove="${index}" aria-label="移除${position.hint}角色">×</button>
      <strong>${position.label}</strong>
      <img src="${member.image}" alt="" />
      <span>${member.name}</span>
    </div>
  `;
}

function renderRosterCard(candidate) {
  const isSelected = activeBattleTeam.includes(candidate.id);
  const isDisabled = !candidate.unlocked;
  const stats = getMemberStats(candidate);

  return `
    <button
      class="roster-card ${isSelected ? "is-selected" : ""} ${isDisabled ? "is-locked" : ""}"
      type="button"
      data-team-toggle="${candidate.id}"
      aria-pressed="${isSelected ? "true" : "false"}"
      aria-label="${isSelected ? "取消選取" : "選取"}${candidate.name}"
      ${isDisabled ? "disabled" : ""}
    >
      <img src="${candidate.image}" alt="${candidate.name}" />
      <span>${isDisabled ? "未解鎖" : candidate.name}</span>
      ${isDisabled ? "" : `
        <div class="roster-stat-line">
          <b>體${stats.maxHp}</b>
          <b>攻${stats.attack}</b>
          <b>防${stats.defense}</b>
        </div>
      `}
    </button>
  `;
}

function renderBattleState() {
  const { district, spirit } = getDistrictBundle(activeBattleDistrictId);
  if (!district || !spirit || !activeBattle) {
    renderMap();
    return;
  }

  if (activeBattle.result === "win" && !activeBattle.rewardClaimed && activeBattleDistrictId === finalBattleId) {
    const progress = loadProgress();
    const bossIntro = getFinalBossIntroduction();
    const rewardCoins = 2000;
    saveProgress({
      ...progress,
      coins: (progress.coins ?? 0) + rewardCoins,
      finalBossDefeated: true,
    });
    activeBattle = {
      ...activeBattle,
      rewardClaimed: true,
      lastMessage: `${activeBattle.lastMessage} 迷霧散去，桃花園地圖完全點亮。獲得 ${rewardCoins} 金幣。${bossIntro?.catchphrase ? ` ${bossIntro.name}：「${bossIntro.catchphrase}」` : ""}`,
    };
  }

  if (activeBattle.result === "win" && !activeBattle.rewardClaimed) {
    const rewardCoins = unlockSpiritAfterWin(spirit, district);
    const spiritIntro = getSpiritIntroduction(spirit);
    const catchphrase = spiritIntro?.catchphrase ? ` ${spirit.name}：「${spiritIntro.catchphrase}」` : "";
    activeBattle = {
      ...activeBattle,
      rewardClaimed: true,
      lastMessage: `${activeBattle.lastMessage}${catchphrase} 獲得 ${rewardCoins} 金幣。`,
    };
  }

  if (activeBattle.result === "win" || activeBattle.result === "lose") {
    renderBattleResultScreen(activeBattle.result);
    return;
  }

  const question = getCurrentQuestion(activeBattle);
  const activeMember = getActiveTeamMember();
  const isAction = activeBattle.phase === "action";
  const isQuestion = activeBattle.phase === "question";
  const isReview = activeBattle.phase === "review";
  const isFinished = activeBattle.phase === "finished";
  const hasReadySkill = hasReadyTeamSkill();

  app.innerHTML = `
    <section class="district-scene battle-stage" style="${getDistrictSceneStyle(district)}">
      <nav class="scene-nav">
        <button type="button" data-district-id="${district.id}">返回介紹</button>
        <button type="button" data-view="home">主畫面</button>
        <button type="button" data-view="pokedex">圖鑑</button>
      </nav>
      <div class="battle-team">
        ${renderBattleTeamActors()}
      </div>
      <div class="battle-enemies">
        ${renderEnemyActors()}
      </div>
      ${isQuestion ? renderQuestionModal(question, activeMember) : renderBattlePrompt(activeMember, isAction, isReview, isFinished, district, hasReadySkill)}
    </section>
  `;
}

function renderBattleResultScreen(result) {
  const image = resultScreenImages[result] ?? resultScreenImages.lose;
  const label = result === "win" ? "挑戰成功，點擊返回主畫面" : "挑戰失敗，點擊返回主畫面";

  app.innerHTML = `
    <button class="battle-result-screen" type="button" data-result-return aria-label="${label}">
      <img src="${image}" alt="${label}" />
    </button>
  `;
}

function renderEnemyActors() {
  return (activeBattle.enemies ?? [activeBattle.enemy])
    .map((enemy, index) => {
      const isDefeated = enemy.hp <= 0;
      const isActive = activeBattle.enemy?.id === enemy.id;
      return `
        <div class="battle-actor enemy-actor enemy-actor-${index + 1} ${isDefeated ? "is-defeated" : ""} ${isActive ? "is-active-target" : ""}">
          <img
            class="actor-portrait spirit-portrait spirit-portrait-image"
            src="${getEnemyImage(enemy)}"
            alt="${enemy.name}"
          />
          ${renderActorHud({
            hp: enemy.hp,
            maxHp: enemy.maxHp,
            label: enemy.name,
            variant: "enemy",
          })}
          <div class="boss-countdown" aria-label="${enemy.name} 出招倒數">${enemy.countdown}</div>
        </div>
      `;
    })
    .join("");
}

function renderQuestionModal(question, activeMember) {
  return `
    <article class="question-modal">
      <div class="battle-status">
        <span>第 ${activeBattle.turn} 回合</span>
        <span>題庫隨機循環</span>
      </div>
      ${renderBattleQuestion(question, true)}
    </article>
  `;
}

function renderBattlePrompt(activeMember, isAction, isReview, isFinished, district, hasReadySkill) {
  const canContinue = isReview || isAction;
  return `
    <article class="question-modal battle-prompt-bar">
      <div>
        <div class="battle-status">
          <span>第 ${activeBattle.turn} 回合</span>
          ${renderAnswerResultStatus()}
        </div>
        ${renderBattleMessage()}
        ${renderAnswerExplanation()}
      </div>
      ${canContinue ? `
        <div class="battle-continue-action">
          <button type="button" data-battle-action="next">繼續答題</button>
        </div>
      ` : ""}
      <div class="battle-actions ${hasReadySkill ? "has-ready-skill" : ""}">
        ${activeBattle.result === "win" ? (
          district.id === finalBattleId
            ? `<button type="button" data-view="home">回到主畫面</button>`
            : `<button type="button" data-district-id="${district.id}">回到地區</button>`
        ) : ""}
        ${activeBattle.result === "lose" ? `<button type="button" data-battle-retry="${district.id}">重新挑戰</button>` : ""}
      </div>
    </article>
  `;
}

function renderAnswerResultStatus() {
  if (!activeBattle?.selectedAnswer) return "";
  return `<span>${activeBattle.answeredCorrectly ? "答對了！獲得 1 點能量。" : "答錯了，沒有獲得能量。"}</span>`;
}

function renderBattleMessage() {
  const message = (activeBattle?.lastMessage ?? "")
    .replace(/^答對了！獲得 \d+ 點能量。/, "")
    .replace(/^答錯了，沒有獲得能量。/, "")
    .trim();

  return message ? `<p class="battle-message">${message}</p>` : "";
}

function renderAnswerExplanation() {
  if (!activeBattle || !activeBattle.selectedAnswer) return "";

  const question = getCurrentQuestion(activeBattle);
  const explanation = activeBattle.lastExplanation || `本題答案是「${question?.answer ?? activeBattle.selectedAnswer}」，請回到題目中的地方特色線索來判斷。`;
  const resultClass = activeBattle.answeredCorrectly ? "is-correct" : "is-wrong";

  return `
    <div class="answer-explanation ${resultClass}">
      <p>${escapeHtml(explanation)}</p>
    </div>
  `;
}

function renderBattleTeamActors() {
  const team = getSelectedBattleTeam();

  return [0, 1, 2]
    .map((index) => {
      const member = team[index];
      if (!member) return "";
      const availableSkills = getMemberSkills(member);
      const actorState = activeBattle.heroes?.find((hero) => hero.id === member.id) ?? activeBattle.hero;
      const canCastSkill = hasMemberReadySkill(member, actorState);
      const isSkillOpen = activeSkillMemberId === member.id && canCastSkill;

      return `
        <div
          class="battle-actor team-actor team-actor-${index + 1} ${canCastSkill ? "can-cast" : ""} ${isSkillOpen ? "is-skill-open" : ""}"
          data-battle-member="${member.id}"
        >
          <img
            class="actor-portrait team-actor-image ${member.type === "spirit" ? "spirit-portrait-image" : "traveler-portrait-image"}"
            src="${member.image}"
            alt="${member.name}"
          />
          ${renderActorHud({
            hp: actorState.hp,
            maxHp: actorState.maxHp,
            energy: actorState.energy,
            maxEnergy: actorState.maxEnergy,
          })}
          ${isSkillOpen ? `
            <div class="skill-popover">
              ${availableSkills.map((skill) => {
                const energyCost = getSkillEnergyCost(skill);
                const canUseSkill = canCastSkill && actorState.energy >= energyCost;
                return `
                  <button
                    type="button"
                    data-battle-action="member-skill"
                    data-battle-skill-member="${member.id}"
                    data-battle-skill-id="${skill.id}"
                    ${canUseSkill ? "" : "disabled"}
                  >
                    ${skill.name}（${energyCost}）
                  </button>
                `;
              }).join("")}
            </div>
          ` : ""}
        </div>
      `;
    })
    .join("");
}

function renderActorHud({ hp, maxHp, energy = null, maxEnergy = null, label = "", variant = "team" }) {
  const hpPercent = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
  const energySlots = Number.isFinite(maxEnergy)
    ? Array.from({ length: maxEnergy }, (_, index) => `
        <span class="energy-cell ${index < energy ? "is-filled" : ""}" aria-hidden="true"></span>
      `).join("")
    : "";

  return `
    <div class="actor-hud actor-hud-${variant}" aria-label="${label ? `${label} ` : ""}HP ${hp} / ${maxHp}${maxEnergy ? ` 能量 ${energy} / ${maxEnergy}` : ""}">
      <div class="hp-track">
        <span style="width: ${hpPercent}%"></span>
      </div>
      <div class="hud-row">
        <span class="hp-readout">HP ${hp}</span>
        ${energySlots ? `<div class="energy-track">${energySlots}</div>` : ""}
      </div>
    </div>
  `;
}

function renderBattleQuestion(question, isQuestion) {
  if (!isQuestion || !question) return "";

  return `
    <div class="question-box">
      <p class="question-text">${escapeHtml(question.question)}</p>
      <div class="answer-grid">
        ${question.options
          .map((option) => {
            return `
              <button
                class="answer-button"
                type="button"
                data-answer="${escapeHtml(option)}"
              >
                ${escapeHtml(option)}
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderPokedex() {
  const progress = loadProgress();
  const ownedSpiritIds = new Set(progress.ownedSpiritIds ?? []);
  const entries = getPokedexEntries(progress, ownedSpiritIds);
  const selectedEntry = entries.find((entry) => entry.id === activePokedexCharacterId && entry.isOwned)
    ?? entries.find((entry) => entry.isOwned)
    ?? entries[0];
  activePokedexCharacterId = selectedEntry.id;

  app.innerHTML = `
    <nav class="topbar">
      <button type="button" data-view="home">返回首頁</button>
      <button type="button" data-view="shop">神社</button>
    </nav>
    <section class="pokedex-view">
      <div class="pokedex-roster" role="tablist" aria-label="桃花園圖鑑角色">
        ${entries.map((entry) => renderPokedexTab(entry, selectedEntry.id)).join("")}
      </div>
      ${renderPokedexDetail(selectedEntry)}
    </section>
  `;
  scrollPageToTop();
}

function getPokedexEntries(progress, ownedSpiritIds) {
  const selectedPlayerId = getSelectedPlayerId(progress);
  const selectedPlayerLevel = getCharacterLevel(selectedPlayerId, progress);
  const selectedPlayerSkillSet = getSelectedPlayerSkillSet(selectedPlayerId);
  const playerIntro = getPlayerIntroduction(selectedPlayerId);
  return [
    {
      id: selectedPlayerId,
      type: "player",
      name: getPlayerDisplayName(selectedPlayerId),
      image: getPlayerAvatarImage(selectedPlayerId),
      group: "玩家角色",
      role: "探索桃園十三區的旅人",
      elements: selectedPlayerSkillSet?.element ?? ["探索", "光"],
      level: selectedPlayerLevel,
      stats: calculateStatsFromLevel(gameConfig.playerBaseStats, selectedPlayerLevel),
      skillSet: selectedPlayerSkillSet,
      title: playerIntro?.title,
      personality: playerIntro?.personality,
      intro: playerIntro?.intro,
      storyDialogue: playerIntro?.storyDialogue ?? [],
      story: playerIntro?.intro ?? "旅人帶著魔法地圖踏上桃花園旅程，透過走讀、答題與精靈同行，逐步認識桃園十三區的地景、產業與人文故事。",
      catchphrase: playerIntro?.catchphrase,
      isOwned: true,
    },
    ...orderedSpirits.map((spirit) => {
      const level = getCharacterLevel(spirit.id, progress);
      const spiritIntro = getSpiritIntroduction(spirit);
      return {
        id: spirit.id,
        type: "spirit",
        name: spirit.name,
        image: getSpiritImage(spirit),
        group: spirit.district,
        role: spirit.role,
        elements: spirit.elements,
        level,
        stats: calculateStatsFromLevel(spirit.stats, level),
        skillSet: skillSetByDistrictId.get(spirit.districtId),
        title: spiritIntro?.title,
        personality: spiritIntro?.personality,
        intro: spiritIntro?.intro,
        storyDialogue: spiritIntro?.storyDialogue ?? [],
        story: spiritIntro?.intro ?? `${spirit.appearance} ${spirit.name}守護著${spirit.district}，與${spirit.features.join("、")}等地方特色緊密相連。`,
        catchphrase: spiritIntro?.catchphrase,
        learningGuide: spiritIntro?.learningGuide,
        isOwned: ownedSpiritIds.has(spirit.id),
      };
    }),
    {
      id: finalBossSpirit.id,
      type: "boss",
      name: finalBossSpirit.name,
      image: getFinalBossImage(),
      group: "迷霧之城",
      role: finalBossSpirit.role,
      elements: finalBossSpirit.elements,
      level: 3,
      stats: finalBossSpirit.stats,
      skillSet: { skills: [] },
      title: getFinalBossIntroduction()?.title,
      personality: getFinalBossIntroduction()?.personality,
      intro: getFinalBossIntroduction()?.intro,
      storyDialogue: getFinalBossIntroduction()?.storyDialogue ?? [],
      story: getFinalBossIntroduction()?.intro ?? "遺忘地方記憶的黑霧，會在十三區全部點亮後現身。",
      catchphrase: getFinalBossIntroduction()?.catchphrase,
      isOwned: hasCompletedAllDistricts(progress),
    },
  ];
}

function renderPokedexTab(entry, selectedId) {
  return `
    <button
      class="pokedex-tab ${entry.id === selectedId ? "is-active" : ""} ${entry.isOwned ? "" : "is-locked"}"
      type="button"
      role="tab"
      aria-selected="${entry.id === selectedId ? "true" : "false"}"
      data-pokedex-character="${entry.id}"
      ${entry.isOwned ? "" : "disabled"}
    >
      <img src="${entry.image}" alt="${entry.name}" />
      <span>${entry.name}</span>
      <small>${getGradeByLevel(entry.level).name}</small>
    </button>
  `;
}

function renderPokedexDetail(entry) {
  return `
    <article class="pokedex-detail">
      <div class="pokedex-detail-hero">
        <img src="${entry.image}" alt="${entry.name}" />
        <div>
          <h2>${entry.name}</h2>
          <p>${getGradeByLevel(entry.level).name}</p>
        </div>
      </div>
      <div class="pokedex-detail-body">
        <section class="pokedex-detail-section pokedex-story-section">
          <h3>故事</h3>
          <p>${entry.story}</p>
        </section>
        <section class="pokedex-detail-section pokedex-stats-section">
          <h3>能力值</h3>
          ${renderStatsGrid(entry.stats)}
        </section>
        <section class="pokedex-detail-section pokedex-skills-section">
          <h3>招式</h3>
          <div class="pokedex-skill-list" aria-label="${entry.name} 招式一覽">
            ${renderSkillList(entry.skillSet, entry.level) || `<div><strong>魔王招式</strong><span>最終戰限定</span><p>迷霧魔王會在戰鬥中使用補血與全體攻擊壓迫隊伍。</p></div>`}
          </div>
        </section>
      </div>
    </article>
  `;
}

function renderSkillList(skillSet, level) {
  return skillSet?.skills.map((skill, index) => {
    const requiredLevel = skillTierLevel[skill.tier] ?? index + 1;
    const isUnlocked = requiredLevel <= level;
    return `
      <div class="${isUnlocked ? "" : "is-locked-skill"}">
                <strong>${skill.name}</strong>
        <span>${getSkillEnergyCost(skill)} 能量｜${getGradeByLevel(requiredLevel).name}${isUnlocked ? "" : "解鎖"}</span>
        <p>${isUnlocked ? skill.description : "前往神社支付金幣祝福升級後解鎖。"}</p>
      </div>
    `;
  }).join("") ?? "";
}

function renderStatsGrid(stats) {
  return `
    <div class="stats-grid">
      <span><b>體力</b><em>${stats.maxHp}</em></span>
      <span><b>攻擊</b><em>${stats.attack}</em></span>
      <span><b>防禦</b><em>${stats.defense}</em></span>
    </div>
  `;
}

function renderShrineStatPreview(currentStats, nextStats = null) {
  const stats = [
    { label: "體力", key: "maxHp" },
    { label: "攻擊", key: "attack" },
    { label: "防禦", key: "defense" },
  ];

  return `
    <div class="shrine-stat-preview" aria-label="升級能力預覽">
      ${stats.map((stat) => `
        <div>
          <span>${stat.label}</span>
          <strong>
            ${currentStats[stat.key]}
            ${nextStats ? `<i aria-hidden="true">→</i><em>${nextStats[stat.key]}</em>` : ""}
          </strong>
        </div>
      `).join("")}
    </div>
  `;
}

function getNewSkillsForNextLevel(skillSet, nextLevel) {
  return skillSet?.skills.filter((skill, index) => {
    const requiredLevel = skillTierLevel[skill.tier] ?? index + 1;
    return requiredLevel === nextLevel;
  }) ?? [];
}

function renderShrineSkillPreview(character, nextLevel) {
  const newSkills = getNewSkillsForNextLevel(character.skillSet, nextLevel);
  if (!newSkills.length) {
    return `<p class="shrine-skill-preview">新技能：本次升級強化能力值</p>`;
  }

  return `
    <div class="shrine-skill-preview">
      <span>新技能</span>
      ${newSkills.map((skill) => `
        <div>
          <strong>${skill.name}（${getSkillEnergyCost(skill)}）</strong>
          <p>${skill.description}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderShop() {
  const progress = loadProgress();
  const shrineCharacters = getBattleRosterCandidates();
  const selectableCharacters = shrineCharacters.filter((character) => character.type === "player" || character.unlocked);
  const selectedCharacter = selectableCharacters.find((character) => character.id === activeShrineCharacterId)
    ?? selectableCharacters[0];
  activeShrineCharacterId = selectedCharacter?.id ?? "";

  app.innerHTML = `
    <section class="shrine-scene">
      <nav class="topbar shrine-topbar">
        <button type="button" data-view="home">返回首頁</button>
        <button type="button" data-view="pokedex">圖鑑</button>
      </nav>
      <div class="shrine-layout">
        <aside class="shrine-roster" aria-label="神社角色列表">
          <p class="shrine-balance">持有金幣：${progress.coins ?? 0}</p>
          <div class="shrine-roster-grid">
            ${shrineCharacters.map((character) => renderShrineRosterButton(character, progress, selectedCharacter?.id)).join("")}
          </div>
        </aside>
        ${selectedCharacter ? renderShrineCard(selectedCharacter, progress) : ""}
      </div>
      ${progress.shrineGuideSeen ? "" : renderShrineIntroOverlay()}
    </section>
  `;
}

function renderShrineRosterButton(character, progress, selectedCharacterId) {
  const level = getCharacterLevel(character.id, progress);
  const isSelected = character.id === selectedCharacterId;
  const isLocked = character.type === "spirit" && !character.unlocked;

  return `
    <button
      class="shrine-roster-card ${isSelected ? "is-selected" : ""} ${isLocked ? "is-locked" : ""}"
      type="button"
      data-shrine-character="${character.id}"
      aria-pressed="${isSelected}"
      ${isLocked ? "disabled" : ""}
    >
      <img src="${character.image}" alt="${character.name}" />
      <span>${isLocked ? "???" : character.name}</span>
      <small>${isLocked ? "未解鎖" : getGradeByLevel(level).name}</small>
    </button>
  `;
}

function renderShrineIntroOverlay() {
  const guideSpirit = orderedSpirits[0];
  const guideImage = guideSpirit ? getSpiritImage(guideSpirit) : "";
  const guideName = guideSpirit?.name ?? "圖鑑精靈";

  return `
    <div class="shrine-intro-overlay" data-dismiss-shrine-guide role="button" tabindex="0" aria-label="關閉神社提示">
      <div class="shrine-intro-guide">
        ${guideImage ? `<img src="${guideImage}" alt="${guideName}" />` : ""}
        <p>點擊角色並支付金幣可以提升精靈等級。升級後會提升體力、攻擊、防禦，並可能解鎖新的招式。</p>
      </div>
    </div>
  `;
}

function renderShrineCard(character, progress) {
  const level = getCharacterLevel(character.id, progress);
  const nextCost = getNextBlessingCost(character, level);
  const stats = getMemberStats(character, progress);
  const nextStats = nextCost ? calculateStatsFromLevel(getCharacterBaseStats(character), level + 1) : null;
  const canBless = Number.isFinite(nextCost) && (progress.coins ?? 0) >= nextCost;

  return `
    <article class="item-card shrine-card shrine-detail-card">
      <img class="shrine-character-image" src="${character.image}" alt="${character.name}" />
      <h3>${character.name}</h3>
      <p class="shrine-level">目前階級 ${getGradeByLevel(level).name}</p>
      ${renderShrineStatPreview(stats, nextStats)}
      ${nextStats ? renderShrineSkillPreview(character, level + 1) : ""}
      ${nextCost ? `
        <button
          type="button"
          data-bless-character="${character.id}"
          ${canBless ? "" : "disabled"}
        >
          祝福升級 ${nextCost} 金幣
        </button>
      ` : `<strong>已達高階</strong>`}
    </article>
  `;
}

function blessCharacter(characterId) {
  const progress = loadProgress();
  const character = getBattleRosterCandidates().find((candidate) => candidate.id === characterId);
  const currentLevel = getCharacterLevel(characterId, progress);
  const nextCost = getNextBlessingCost(character, currentLevel);
  if (!nextCost || (progress.coins ?? 0) < nextCost) return;

  saveProgress({
    ...progress,
    coins: (progress.coins ?? 0) - nextCost,
    characterLevels: {
      ...(progress.characterLevels ?? {}),
      [characterId]: currentLevel + 1,
    },
  });
}

app.addEventListener("submit", (event) => {
  const loginForm = event.target.closest("[data-login-form]");
  if (!loginForm) return;

  event.preventDefault();
  const formData = new FormData(loginForm);
  const studentId = String(formData.get("studentId") ?? "").trim();
  const selectedPlayerId = formData.get("playerId") === "player_girl" ? "player_girl" : "player_boy";
  const error = loginForm.querySelector("[data-login-error]");

  if (!/^\d{5}$/.test(studentId)) {
    if (error) error.textContent = "請輸入 5 位數字學號。";
    return;
  }

  loginProgress(
    studentId,
    selectedPlayerId,
    studentId === teacherAccountId ? getTeacherProgressPatch(selectedPlayerId) : {},
  );
  activeBattleTeam = [selectedPlayerId, null, null];
  activePokedexCharacterId = selectedPlayerId;
  activeShrineCharacterId = selectedPlayerId;
  isLoginPanelOpen = false;
  renderHome();
});

app.addEventListener("input", (event) => {
  const studentIdInput = event.target.closest("input[name='studentId']");
  if (!studentIdInput) return;

  studentIdInput.value = studentIdInput.value.replace(/\D/g, "").slice(0, 5);
});

app.addEventListener("click", (event) => {
  const fullscreenButton = event.target.closest("[data-fullscreen]");
  if (fullscreenButton) {
    requestGameFullscreen();
    return;
  }

  const openLoginButton = event.target.closest("[data-open-login]");
  if (openLoginButton) {
    isLoginPanelOpen = true;
    renderLogin();
    return;
  }

  const logoutButton = event.target.closest("[data-logout]");
  if (logoutButton) {
    logoutProgress();
    activeBattle = null;
    activeBattleDistrictId = "";
    activeBattleTeam = [null, null, null];
    activeSkillMemberId = "";
    activePokedexCharacterId = "player_boy";
    activeShrineCharacterId = "";
    isLoginPanelOpen = false;
    renderLogin();
    return;
  }

  const shrineGuideDismiss = event.target.closest("[data-dismiss-shrine-guide]");
  if (shrineGuideDismiss) {
    const progress = loadProgress();
    saveProgress({
      ...progress,
      shrineGuideSeen: true,
    });
    renderShop();
    return;
  }

  const finalIntroButton = event.target.closest("[data-final-intro]");
  if (finalIntroButton) {
    if (!hasCompletedAllDistricts()) return;
    renderFinalBossIntro();
    return;
  }

  const finalBattleButton = event.target.closest("[data-final-battle-id]");
  if (finalBattleButton) {
    renderFinalBattleTeamSelect();
    return;
  }

  const startFinalBattleButton = event.target.closest("[data-start-final-battle]");
  if (startFinalBattleButton) {
    renderFinalBattle();
    return;
  }

  const pokedexCharacterButton = event.target.closest("[data-pokedex-character]");
  if (pokedexCharacterButton) {
    if (pokedexCharacterButton.disabled) return;
    activePokedexCharacterId = pokedexCharacterButton.dataset.pokedexCharacter;
    renderPokedex();
    return;
  }

  const blessButton = event.target.closest("[data-bless-character]");
  if (blessButton) {
    blessCharacter(blessButton.dataset.blessCharacter);
    renderShop();
    return;
  }

  const shrineCharacterButton = event.target.closest("[data-shrine-character]");
  if (shrineCharacterButton) {
    activeShrineCharacterId = shrineCharacterButton.dataset.shrineCharacter;
    renderShop();
    return;
  }

  const memberSkillButton = event.target.closest("[data-battle-action='member-skill']");
  if (memberSkillButton && activeBattle) {
    const member = getSelectedBattleTeam().find((item) => item?.id === memberSkillButton.dataset.battleSkillMember);
    const skill = getMemberSkill(member, memberSkillButton.dataset.battleSkillId);
    const actorState = activeBattle.heroes?.find((hero) => hero.id === member?.id) ?? activeBattle.hero;
    if (member && skill && activeBattle.phase === "action" && actorState.hp > 0 && actorState.energy >= getSkillEnergyCost(skill)) {
      activeSkillMemberId = "";
      activeBattle = useUltimate(activeBattle, skill, member.name, member.id);
      renderBattleState();
    }
    return;
  }

  const districtButton = event.target.closest("[data-district-id]");
  if (districtButton) {
    if (districtButton.disabled) return;
    renderDistrictIntro(districtButton.dataset.districtId);
    return;
  }

  const battleButton = event.target.closest("[data-battle-id]");
  if (battleButton) {
    renderBattleTeamSelect(battleButton.dataset.battleId);
    return;
  }

  const teamToggleButton = event.target.closest("[data-team-toggle]");
  if (teamToggleButton) {
    if (teamToggleButton.disabled) return;
    toggleBattleTeamMember(teamToggleButton.dataset.teamToggle);

    if (activeBattleDistrictId === finalBattleId) renderFinalBattleTeamSelect();
    else renderBattleTeamSelect(activeBattleDistrictId);
    return;
  }

  const teamPlaceButton = event.target.closest("[data-team-place]");
  if (teamPlaceButton) {
    const candidateId = teamPlaceButton.dataset.teamPlace;
    const slotIndex = Number(teamPlaceButton.dataset.teamSlot);

    activeBattleTeam = activeBattleTeam.map((id) => id === candidateId ? null : id);
    activeBattleTeam[slotIndex] = candidateId;

    if (activeBattleDistrictId === finalBattleId) renderFinalBattleTeamSelect();
    else renderBattleTeamSelect(activeBattleDistrictId);
    return;
  }

  const teamRemoveButton = event.target.closest("[data-team-remove]");
  if (teamRemoveButton) {
    const slotIndex = Number(teamRemoveButton.dataset.teamRemove);
    activeBattleTeam[slotIndex] = null;

    if (activeBattleDistrictId === finalBattleId) renderFinalBattleTeamSelect();
    else renderBattleTeamSelect(activeBattleDistrictId);
    return;
  }

  const startBattleButton = event.target.closest("[data-start-battle]");
  if (startBattleButton) {
    renderBattle(startBattleButton.dataset.startBattle);
    return;
  }

  const retryButton = event.target.closest("[data-battle-retry]");
  if (retryButton) {
    if (retryButton.dataset.battleRetry === finalBattleId) renderFinalBattle();
    else renderBattle(retryButton.dataset.battleRetry);
    return;
  }

  const resultReturnButton = event.target.closest("[data-result-return]");
  if (resultReturnButton) {
    activeBattle = null;
    activeBattleDistrictId = "";
    activeSkillMemberId = "";
    renderHome();
    return;
  }

  const answerButton = event.target.closest("[data-answer]");
  if (answerButton && activeBattle) {
    activeSkillMemberId = "";
    activeBattle = answerQuestion(activeBattle, answerButton.dataset.answer);
    renderBattleState();
    return;
  }

  const battleActionButton = event.target.closest("[data-battle-action]");
  if (battleActionButton && activeBattle) {
    const action = battleActionButton.dataset.battleAction;

    if (action === "next") {
      activeSkillMemberId = "";
      activeBattle = goToNextQuestion(activeBattle);
      renderBattleState();
      return;
    }
  }

  const battleMember = event.target.closest("[data-battle-member]");
  if (battleMember && activeBattle?.phase === "action") {
    const member = getSelectedBattleTeam().find((item) => item?.id === battleMember.dataset.battleMember);
    const actorState = activeBattle.heroes?.find((hero) => hero.id === member?.id) ?? activeBattle.hero;
    activeSkillMemberId = member && hasMemberReadySkill(member, actorState) && activeSkillMemberId !== member.id ? member.id : "";
    renderBattleState();
    return;
  }

  const button = event.target.closest("[data-view]");
  if (!button) return;

  const view = button.dataset.view;
  if (view === "home") renderHome();
  if (view === "map") renderMap();
  if (view === "pokedex") renderPokedex();
  if (view === "shop") renderShop();
});

renderZhuyinToggle();
renderAppStart();
