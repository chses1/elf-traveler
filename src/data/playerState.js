export const initialPlayerState = {
  isLoggedIn: false,
  studentId: "",
  selectedPlayerId: "player_boy",
  coins: 0,
  inventory: {
    smallPeachPotion: 3,
    mediumPeachPotion: 0,
    largePeachPotion: 0,
    energyJelly: 0,
    revivePeachSeed: 0,
    mapHintCard: 0,
  },
  ownedSpiritIds: [],
  completedDistrictIds: [],
  finalBossDefeated: false,
  currentTeam: [],
  pokedexUnlockedIds: [],
  shrineGuideSeen: false,
  characterLevels: {
    player_boy: 1,
    player_girl: 1,
  },
};
