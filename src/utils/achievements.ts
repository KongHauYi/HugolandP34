import { Achievement, GameState } from '../types/game';

export const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Basic Progression
  {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first battle',
    icon: '🏆',
    maxProgress: 1,
    reward: { coins: 50, gems: 5 }
  },
  {
    id: 'zone_master_10',
    name: 'Zone Explorer',
    description: 'Reach Zone 10',
    icon: '🗺️',
    maxProgress: 10,
    reward: { coins: 200, gems: 10 }
  },
  {
    id: 'zone_master_25',
    name: 'Zone Conqueror',
    description: 'Reach Zone 25',
    icon: '⚔️',
    maxProgress: 25,
    reward: { coins: 500, gems: 25 }
  },
  {
    id: 'zone_master_50',
    name: 'Zone Legend',
    description: 'Reach Zone 50 and unlock Premium',
    icon: '👑',
    maxProgress: 50,
    reward: { coins: 1000, gems: 50, special: 'Premium Access' }
  },
  {
    id: 'zone_master_100',
    name: 'Zone Master',
    description: 'Reach Zone 100',
    icon: '🏔️',
    maxProgress: 100,
    reward: { coins: 2000, gems: 100 }
  },

  // Collection Achievements
  {
    id: 'collector_25',
    name: 'Item Collector',
    description: 'Collect 25 different items',
    icon: '📦',
    maxProgress: 25,
    reward: { coins: 300, gems: 15 }
  },
  {
    id: 'collector_50',
    name: 'Master Collector',
    description: 'Collect 50 different items',
    icon: '🎒',
    maxProgress: 50,
    reward: { coins: 750, gems: 35 }
  },

  // Research Achievements
  {
    id: 'scholar_tier_5',
    name: 'Scholar',
    description: 'Reach Research Level 5',
    icon: '🧠',
    maxProgress: 5,
    reward: { coins: 400, gems: 20 }
  },
  {
    id: 'scholar_tier_10',
    name: 'Master Scholar',
    description: 'Reach Research Level 10',
    icon: '📚',
    maxProgress: 10,
    reward: { coins: 800, gems: 40 }
  },

  // Knowledge Streak Achievements
  {
    id: 'streak_master_10',
    name: 'Knowledge Streak',
    description: 'Get 10 correct answers in a row',
    icon: '🔥',
    maxProgress: 10,
    reward: { coins: 250, gems: 12 }
  },
  {
    id: 'streak_master_25',
    name: 'Genius Streak',
    description: 'Get 25 correct answers in a row',
    icon: '⚡',
    maxProgress: 25,
    reward: { coins: 600, gems: 30 }
  },

  // Wealth Achievements
  {
    id: 'wealthy_1000',
    name: 'Coin Collector',
    description: 'Earn 1000 total coins',
    icon: '💰',
    maxProgress: 1000,
    reward: { gems: 20 }
  },
  {
    id: 'wealthy_10000',
    name: 'Rich Adventurer',
    description: 'Earn 10,000 total coins',
    icon: '💎',
    maxProgress: 10000,
    reward: { gems: 50 }
  },

  // Gem Achievements
  {
    id: 'gem_collector_100',
    name: 'Gem Collector',
    description: 'Earn 100 total gems',
    icon: '💎',
    maxProgress: 100,
    reward: { coins: 500 }
  },

  // Chest Opening Achievements
  {
    id: 'chest_opener_10',
    name: 'Treasure Hunter',
    description: 'Open 10 chests',
    icon: '🗝️',
    maxProgress: 10,
    reward: { coins: 200, gems: 10 }
  },

  // Combat Achievements
  {
    id: 'warrior_100',
    name: 'Warrior',
    description: 'Win 100 battles',
    icon: '⚔️',
    maxProgress: 100,
    reward: { coins: 1000, gems: 50 }
  },

  // Mining Achievements
  {
    id: 'miner_100',
    name: 'Gem Miner',
    description: 'Mine 100 gems',
    icon: '⛏️',
    maxProgress: 100,
    reward: { coins: 500, gems: 25 }
  },

  // Auction House Achievement
  {
    id: 'trader_first',
    name: 'First Trade',
    description: 'Buy your first item from the auction house',
    icon: '🏛️',
    maxProgress: 1,
    reward: { coins: 100, gems: 5 }
  }
];

export const checkAchievements = (gameState: GameState): Achievement[] => {
  const newUnlocks: Achievement[] = [];
  
  achievementDefinitions.forEach(def => {
    const existing = gameState.achievements.find(a => a.id === def.id);
    if (existing?.unlocked) return;

    let progress = 0;
    let shouldUnlock = false;

    switch (def.id) {
      case 'first_victory':
        progress = gameState.zone > 1 ? 1 : 0;
        shouldUnlock = progress >= 1;
        break;
      case 'zone_master_10':
        progress = Math.min(gameState.zone, 10);
        shouldUnlock = gameState.zone >= 10;
        break;
      case 'zone_master_25':
        progress = Math.min(gameState.zone, 25);
        shouldUnlock = gameState.zone >= 25;
        break;
      case 'zone_master_50':
        progress = Math.min(gameState.zone, 50);
        shouldUnlock = gameState.zone >= 50;
        break;
      case 'zone_master_100':
        progress = Math.min(gameState.zone, 100);
        shouldUnlock = gameState.zone >= 100;
        break;
      case 'collector_25':
        progress = Math.min(gameState.collectionBook.totalWeaponsFound + gameState.collectionBook.totalArmorFound, 25);
        shouldUnlock = progress >= 25;
        break;
      case 'collector_50':
        progress = Math.min(gameState.collectionBook.totalWeaponsFound + gameState.collectionBook.totalArmorFound, 50);
        shouldUnlock = progress >= 50;
        break;
      case 'scholar_tier_5':
        progress = Math.min(gameState.research.level, 5);
        shouldUnlock = gameState.research.level >= 5;
        break;
      case 'scholar_tier_10':
        progress = Math.min(gameState.research.level, 10);
        shouldUnlock = gameState.research.level >= 10;
        break;
      case 'streak_master_10':
        progress = Math.min(gameState.knowledgeStreak.best, 10);
        shouldUnlock = gameState.knowledgeStreak.best >= 10;
        break;
      case 'streak_master_25':
        progress = Math.min(gameState.knowledgeStreak.best, 25);
        shouldUnlock = gameState.knowledgeStreak.best >= 25;
        break;
      case 'wealthy_1000':
        progress = Math.min(gameState.statistics.coinsEarned, 1000);
        shouldUnlock = gameState.statistics.coinsEarned >= 1000;
        break;
      case 'wealthy_10000':
        progress = Math.min(gameState.statistics.coinsEarned, 10000);
        shouldUnlock = gameState.statistics.coinsEarned >= 10000;
        break;
      case 'gem_collector_100':
        progress = Math.min(gameState.statistics.gemsEarned, 100);
        shouldUnlock = gameState.statistics.gemsEarned >= 100;
        break;
      case 'chest_opener_10':
        progress = Math.min(gameState.statistics.chestsOpened, 10);
        shouldUnlock = gameState.statistics.chestsOpened >= 10;
        break;
      case 'warrior_100':
        progress = Math.min(gameState.statistics.totalVictories, 100);
        shouldUnlock = gameState.statistics.totalVictories >= 100;
        break;
      case 'miner_100':
        progress = Math.min(gameState.mining.totalGemsMined, 100);
        shouldUnlock = gameState.mining.totalGemsMined >= 100;
        break;
      case 'trader_first':
        // This would be tracked when purchasing from auction house
        progress = 0; // Placeholder
        shouldUnlock = false;
        break;
    }

    if (shouldUnlock && !existing?.unlocked) {
      newUnlocks.push({
        ...def,
        unlocked: true,
        unlockedAt: new Date(),
        progress: def.maxProgress
      });
    } else if (existing) {
      existing.progress = progress;
    }
  });

  return newUnlocks;
};

export const initializeAchievements = (): Achievement[] => {
  return achievementDefinitions.map(def => ({
    ...def,
    unlocked: false,
    progress: 0
  }));
};