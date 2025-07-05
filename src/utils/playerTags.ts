import { PlayerTag, GameState } from '../types/game';

export const tagDefinitions: Omit<PlayerTag, 'unlocked' | 'unlockedAt'>[] = [
  // Zone-based tags
  {
    id: 'zone_explorer',
    name: 'Zone Explorer',
    description: 'Reach Zone 25',
    icon: '🗺️',
    color: 'text-green-400'
  },
  {
    id: 'zone_master',
    name: 'Zone Master',
    description: 'Reach Zone 100',
    icon: '🏔️',
    color: 'text-blue-400'
  },

  // Wealth tags
  {
    id: 'coin_collector',
    name: 'Coin Collector',
    description: 'Earn 10,000 total coins',
    icon: '💰',
    color: 'text-yellow-400'
  },
  {
    id: 'gem_collector',
    name: 'Gem Collector',
    description: 'Earn 1,000 total gems',
    icon: '💎',
    color: 'text-purple-400'
  },

  // Knowledge tags
  {
    id: 'knowledge_master',
    name: 'Knowledge Master',
    description: 'Answer 1,000 questions correctly',
    icon: '🧠',
    color: 'text-blue-400'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Get 50 correct answers in a row',
    icon: '🔥',
    color: 'text-orange-400'
  },

  // Combat tags
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Win 500 battles',
    icon: '⚔️',
    color: 'text-red-400'
  },

  // Collection tags
  {
    id: 'collector',
    name: 'Collector',
    description: 'Collect 50 different items',
    icon: '📦',
    color: 'text-cyan-400'
  },

  // Mining tags
  {
    id: 'miner',
    name: 'Miner',
    description: 'Mine 1,000 gems',
    icon: '⛏️',
    color: 'text-gray-400'
  },

  // Special tags
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Reach Research Level 25',
    icon: '📚',
    color: 'text-blue-400'
  },

  // Premium tags
  {
    id: 'premium_member',
    name: 'Premium Member',
    description: 'Unlock Premium status',
    icon: '👑',
    color: 'text-yellow-400'
  },

  // Auction House tag
  {
    id: 'trader',
    name: 'Trader',
    description: 'Complete 10 auction house transactions',
    icon: '🏛️',
    color: 'text-indigo-400'
  }
];

export const checkPlayerTags = (gameState: GameState): PlayerTag[] => {
  const newUnlocks: PlayerTag[] = [];
  
  tagDefinitions.forEach(def => {
    const existing = gameState.playerTags.find(t => t.id === def.id);
    if (existing?.unlocked) return;

    let shouldUnlock = false;

    switch (def.id) {
      case 'zone_explorer':
        shouldUnlock = gameState.zone >= 25;
        break;
      case 'zone_master':
        shouldUnlock = gameState.zone >= 100;
        break;
      case 'coin_collector':
        shouldUnlock = gameState.statistics.coinsEarned >= 10000;
        break;
      case 'gem_collector':
        shouldUnlock = gameState.statistics.gemsEarned >= 1000;
        break;
      case 'knowledge_master':
        shouldUnlock = gameState.statistics.correctAnswers >= 1000;
        break;
      case 'streak_master':
        shouldUnlock = gameState.knowledgeStreak.best >= 50;
        break;
      case 'warrior':
        shouldUnlock = gameState.statistics.totalVictories >= 500;
        break;
      case 'collector':
        shouldUnlock = (gameState.collectionBook.totalWeaponsFound + gameState.collectionBook.totalArmorFound) >= 50;
        break;
      case 'miner':
        shouldUnlock = gameState.mining.totalGemsMined >= 1000;
        break;
      case 'scholar':
        shouldUnlock = gameState.research.level >= 25;
        break;
      case 'premium_member':
        shouldUnlock = gameState.isPremium;
        break;
      case 'trader':
        // This would be tracked based on auction house activity
        shouldUnlock = false; // Placeholder
        break;
    }

    if (shouldUnlock && !existing?.unlocked) {
      newUnlocks.push({
        ...def,
        unlocked: true,
        unlockedAt: new Date()
      });
    }
  });

  return newUnlocks;
};

export const initializePlayerTags = (): PlayerTag[] => {
  return tagDefinitions.map(def => ({
    ...def,
    unlocked: false
  }));
};