export const gameConfig = {
  maxTeamSize: 3,
  maxEnergy: 6,
  correctAnswerEnergy: 1,
  hardQuestionEnergy: 1,
  streakBonusThreshold: 3,
  streakBonusEnergy: 0,
  expPerLevel: 100,
  levelUpGrowth: {
    maxHp: 22,
    attack: 5,
    defense: 4,
    speed: 1,
  },
  characterGrades: [
    { level: 1, id: "low", name: "初階", unlockedSkillCount: 1 },
    { level: 2, id: "mid", name: "中階", unlockedSkillCount: 2 },
    { level: 3, id: "high", name: "高階", unlockedSkillCount: 3 },
  ],
  playerBlessingCosts: {
    2: 60,
    3: 120,
  },
  spiritBlessingCosts: {
    2: 40,
    3: 90,
  },
  spiritBlessingCostGrowth: {
    2: 10,
    3: 20,
  },
  playerBaseStats: {
    hp: 105,
    maxHp: 105,
    attack: 22,
    defense: 11,
    speed: 13,
    energy: 0,
    maxEnergy: 6,
    level: 1,
    exp: 0,
  },
  battleRewards: {
    normalSpirit: {
      exp: 20,
      coins: 100,
    },
    districtBoss: {
      exp: 50,
      coins: 20,
    },
  },
  rewardCoinGrowthPerDistrict: 10,
};
