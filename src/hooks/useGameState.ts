import { useState, useEffect, useCallback } from 'react';
import { GameState, Weapon, Armor, Enemy, ChestReward, AuctionItem } from '../types/game';
import { generateWeapon, generateArmor, generateEnemy, getChestRarityWeights, calculateResearchBonus } from '../utils/gameUtils';
import { checkAchievements, initializeAchievements } from '../utils/achievements';
import { checkPlayerTags, initializePlayerTags } from '../utils/playerTags';
import AsyncStorage from '../utils/storage';

const STORAGE_KEY = 'hugoland-game-state';

const createInitialGameState = (): GameState => ({
  coins: 500,
  gems: 50,
  shinyGems: 0,
  zone: 1,
  playerStats: {
    hp: 100,
    maxHp: 100,
    atk: 20, // Doubled from 10
    def: 10,
    baseAtk: 20, // Doubled from 10
    baseDef: 10,
    baseHp: 100
  },
  inventory: {
    weapons: [],
    armor: [],
    currentWeapon: null,
    currentArmor: null
  },
  currentEnemy: null,
  inCombat: false,
  combatLog: [],
  research: {
    level: 1,
    totalSpent: 0,
    availableUpgrades: ['atk', 'def', 'hp']
  },
  isPremium: false,
  achievements: initializeAchievements(),
  collectionBook: {
    weapons: {},
    armor: {},
    totalWeaponsFound: 0,
    totalArmorFound: 0,
    rarityStats: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythical: 0
    }
  },
  knowledgeStreak: {
    current: 0,
    best: 0,
    multiplier: 1
  },
  gameMode: {
    current: 'normal',
    speedModeActive: false,
    survivalLives: 3,
    maxSurvivalLives: 3
  },
  statistics: {
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    totalPlayTime: 0,
    zonesReached: 1,
    itemsCollected: 0,
    coinsEarned: 0,
    gemsEarned: 0,
    shinyGemsEarned: 0,
    chestsOpened: 0,
    accuracyByCategory: {},
    sessionStartTime: new Date(),
    totalDeaths: 0,
    totalVictories: 0,
    longestStreak: 0,
    fastestVictory: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    itemsUpgraded: 0,
    itemsSold: 0,
    totalResearchSpent: 0,
    averageAccuracy: 0,
    revivals: 0
  },
  cheats: {
    infiniteCoins: false,
    infiniteGems: false,
    obtainAnyItem: false
  },
  mining: {
    totalGemsMined: 0,
    totalShinyGemsMined: 0
  },
  playerTags: initializePlayerTags(),
  dailyRewards: {
    lastClaimDate: null,
    currentStreak: 0,
    maxStreak: 0,
    availableReward: null,
    rewardHistory: []
  },
  progression: {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    skillPoints: 0,
    unlockedSkills: [],
    prestigeLevel: 0,
    prestigePoints: 0,
    masteryLevels: {}
  },
  offlineProgress: {
    lastSaveTime: new Date(),
    offlineCoins: 0,
    offlineGems: 0,
    offlineTime: 0,
    maxOfflineHours: 24
  },
  settings: {
    colorblindMode: false,
    darkMode: true,
    language: 'en',
    notifications: true,
    snapToGrid: false,
    beautyMode: false
  },
  hasUsedRevival: false,
  skills: {
    activeMenuSkill: null,
    lastRollTime: null,
    playTimeThisSession: 0,
    sessionStartTime: new Date()
  },
  adventureSkills: {
    selectedSkill: null,
    availableSkills: [],
    showSelectionModal: false,
    skillEffects: {
      skipCardUsed: false,
      metalShieldUsed: false,
      dodgeUsed: false,
      truthLiesActive: false,
      lightningChainActive: false,
      rampActive: false,
      berserkerActive: false,
      vampiricActive: false,
      phoenixUsed: false,
      timeSlowActive: false,
      criticalStrikeActive: false,
      shieldWallActive: false,
      poisonBladeActive: false,
      arcaneShieldActive: false,
      battleFrenzyActive: false,
      elementalMasteryActive: false,
      shadowStepUsed: false,
      healingAuraActive: false,
      doubleStrikeActive: false,
      manaShieldActive: false,
      berserkRageActive: false,
      divineProtectionUsed: false,
      stormCallActive: false,
      bloodPactActive: false,
      frostArmorActive: false,
      fireballActive: false
    }
  },
  auctionHouse: {
    items: [],
    lastRefresh: new Date(),
    nextRefresh: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    playerListings: []
  }
});

// Generate sample auction items
const generateAuctionItems = (): AuctionItem[] => {
  const items: AuctionItem[] = [];
  const itemCount = Math.floor(Math.random() * 8) + 4; // 4-12 items
  
  for (let i = 0; i < itemCount; i++) {
    const isWeapon = Math.random() < 0.5;
    const item = isWeapon ? generateWeapon() : generateArmor();
    
    // Set a reasonable price (1.5x to 3x sell price)
    const priceMultiplier = 1.5 + Math.random() * 1.5;
    const price = Math.floor(item.sellPrice * priceMultiplier);
    
    // Random time remaining (1-24 hours)
    const timeRemaining = Math.floor(Math.random() * 24) + 1;
    
    // Random seller name
    const sellerNames = ['Adventurer', 'Knight', 'Mage', 'Warrior', 'Rogue', 'Paladin', 'Archer', 'Wizard'];
    const seller = sellerNames[Math.floor(Math.random() * sellerNames.length)] + Math.floor(Math.random() * 999);
    
    items.push({
      id: Math.random().toString(36).substr(2, 9),
      item,
      price,
      seller,
      timeRemaining,
      listedAt: new Date()
    });
  }
  
  return items;
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load game state from storage
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          
          // Ensure auction house exists and is properly initialized
          if (!parsedState.auctionHouse) {
            parsedState.auctionHouse = {
              items: generateAuctionItems(),
              lastRefresh: new Date(),
              nextRefresh: new Date(Date.now() + 5 * 60 * 1000),
              playerListings: []
            };
          }
          
          // Convert date strings back to Date objects
          parsedState.statistics.sessionStartTime = new Date(parsedState.statistics.sessionStartTime);
          parsedState.offlineProgress.lastSaveTime = new Date(parsedState.offlineProgress.lastSaveTime);
          parsedState.skills.sessionStartTime = new Date(parsedState.skills.sessionStartTime);
          parsedState.auctionHouse.lastRefresh = new Date(parsedState.auctionHouse.lastRefresh);
          parsedState.auctionHouse.nextRefresh = new Date(parsedState.auctionHouse.nextRefresh);
          
          // Double ATK if not already doubled
          if (parsedState.playerStats.baseAtk < 20) {
            parsedState.playerStats.atk *= 2;
            parsedState.playerStats.baseAtk *= 2;
          }
          
          setGameState(parsedState);
        } else {
          const initialState = createInitialGameState();
          initialState.auctionHouse.items = generateAuctionItems();
          setGameState(initialState);
        }
      } catch (error) {
        console.error('Error loading game state:', error);
        const initialState = createInitialGameState();
        initialState.auctionHouse.items = generateAuctionItems();
        setGameState(initialState);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, []);

  // Save game state to storage
  const saveGameState = useCallback(async (state: GameState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      saveGameState(gameState);
    }, 10000);

    return () => clearInterval(interval);
  }, [gameState, saveGameState]);

  // Auction house refresh timer
  useEffect(() => {
    if (!gameState) return;

    const checkAuctionRefresh = () => {
      const now = new Date();
      if (now >= new Date(gameState.auctionHouse.nextRefresh)) {
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            auctionHouse: {
              ...prev.auctionHouse,
              items: generateAuctionItems(),
              lastRefresh: now,
              nextRefresh: new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes from now
            }
          };
        });
      }
    };

    const interval = setInterval(checkAuctionRefresh, 1000); // Check every second
    return () => clearInterval(interval);
  }, [gameState]);

  // Equipment functions
  const equipWeapon = useCallback((weapon: Weapon) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const researchBonus = calculateResearchBonus(prev.research.level);
      const newStats = {
        ...prev.playerStats,
        atk: prev.playerStats.baseAtk * 2 + weapon.baseAtk + researchBonus // Double base ATK
      };

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          currentWeapon: weapon
        },
        playerStats: newStats
      };
    });
  }, []);

  const equipArmor = useCallback((armor: Armor) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const researchBonus = calculateResearchBonus(prev.research.level);
      const newStats = {
        ...prev.playerStats,
        def: prev.playerStats.baseDef + armor.baseDef + researchBonus
      };

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          currentArmor: armor
        },
        playerStats: newStats
      };
    });
  }, []);

  // Auction house functions
  const purchaseAuctionItem = useCallback((itemId: string): boolean => {
    if (!gameState) return false;

    const auctionItem = gameState.auctionHouse.items.find(item => item.id === itemId);
    if (!auctionItem || gameState.coins < auctionItem.price) {
      return false;
    }

    setGameState(prev => {
      if (!prev) return prev;

      const newInventory = { ...prev.inventory };
      if ('baseAtk' in auctionItem.item) {
        newInventory.weapons = [...newInventory.weapons, auctionItem.item as Weapon];
      } else {
        newInventory.armor = [...newInventory.armor, auctionItem.item as Armor];
      }

      return {
        ...prev,
        coins: prev.coins - auctionItem.price,
        inventory: newInventory,
        auctionHouse: {
          ...prev.auctionHouse,
          items: prev.auctionHouse.items.filter(item => item.id !== itemId)
        }
      };
    });

    return true;
  }, [gameState]);

  const listAuctionItem = useCallback((item: Weapon | Armor, price: number): boolean => {
    if (!gameState) return false;

    // Check if item exists in inventory
    const isWeapon = 'baseAtk' in item;
    const itemExists = isWeapon 
      ? gameState.inventory.weapons.some(w => w.id === item.id)
      : gameState.inventory.armor.some(a => a.id === item.id);

    if (!itemExists) return false;

    setGameState(prev => {
      if (!prev) return prev;

      // Remove item from inventory
      const newInventory = { ...prev.inventory };
      if (isWeapon) {
        newInventory.weapons = newInventory.weapons.filter(w => w.id !== item.id);
        // Unequip if currently equipped
        if (newInventory.currentWeapon?.id === item.id) {
          newInventory.currentWeapon = null;
        }
      } else {
        newInventory.armor = newInventory.armor.filter(a => a.id !== item.id);
        // Unequip if currently equipped
        if (newInventory.currentArmor?.id === item.id) {
          newInventory.currentArmor = null;
        }
      }

      // Create auction listing
      const auctionItem: AuctionItem = {
        id: Math.random().toString(36).substr(2, 9),
        item,
        price,
        seller: 'You',
        timeRemaining: 24,
        listedAt: new Date()
      };

      return {
        ...prev,
        inventory: newInventory,
        auctionHouse: {
          ...prev.auctionHouse,
          playerListings: [...prev.auctionHouse.playerListings, auctionItem]
        }
      };
    });

    return true;
  }, [gameState]);

  // Other game functions (simplified versions of the main ones)
  const upgradeWeapon = useCallback((weaponId: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const weapon = prev.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon || prev.gems < weapon.upgradeCost) return prev;

      const updatedWeapons = prev.inventory.weapons.map(w => 
        w.id === weaponId 
          ? { ...w, level: w.level + 1, baseAtk: w.baseAtk + 10, upgradeCost: Math.floor(w.upgradeCost * 1.5) }
          : w
      );

      return {
        ...prev,
        gems: prev.gems - weapon.upgradeCost,
        inventory: {
          ...prev.inventory,
          weapons: updatedWeapons,
          currentWeapon: prev.inventory.currentWeapon?.id === weaponId 
            ? updatedWeapons.find(w => w.id === weaponId) || prev.inventory.currentWeapon
            : prev.inventory.currentWeapon
        }
      };
    });
  }, []);

  const upgradeArmor = useCallback((armorId: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const armor = prev.inventory.armor.find(a => a.id === armorId);
      if (!armor || prev.gems < armor.upgradeCost) return prev;

      const updatedArmor = prev.inventory.armor.map(a => 
        a.id === armorId 
          ? { ...a, level: a.level + 1, baseDef: a.baseDef + 5, upgradeCost: Math.floor(a.upgradeCost * 1.5) }
          : a
      );

      return {
        ...prev,
        gems: prev.gems - armor.upgradeCost,
        inventory: {
          ...prev.inventory,
          armor: updatedArmor,
          currentArmor: prev.inventory.currentArmor?.id === armorId 
            ? updatedArmor.find(a => a.id === armorId) || prev.inventory.currentArmor
            : prev.inventory.currentArmor
        }
      };
    });
  }, []);

  const sellWeapon = useCallback((weaponId: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const weapon = prev.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon) return prev;

      return {
        ...prev,
        coins: prev.coins + weapon.sellPrice,
        inventory: {
          ...prev.inventory,
          weapons: prev.inventory.weapons.filter(w => w.id !== weaponId),
          currentWeapon: prev.inventory.currentWeapon?.id === weaponId ? null : prev.inventory.currentWeapon
        }
      };
    });
  }, []);

  const sellArmor = useCallback((armorId: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const armor = prev.inventory.armor.find(a => a.id === armorId);
      if (!armor) return prev;

      return {
        ...prev,
        coins: prev.coins + armor.sellPrice,
        inventory: {
          ...prev.inventory,
          armor: prev.inventory.armor.filter(a => a.id !== armorId),
          currentArmor: prev.inventory.currentArmor?.id === armorId ? null : prev.inventory.currentArmor
        }
      };
    });
  }, []);

  // Simplified implementations for other functions
  const openChest = useCallback((cost: number): ChestReward | null => {
    if (!gameState || gameState.coins < cost) return null;

    const weights = getChestRarityWeights(cost);
    const isWeapon = Math.random() < 0.5;
    const item = isWeapon ? generateWeapon() : generateArmor();

    setGameState(prev => {
      if (!prev) return prev;
      
      const newInventory = { ...prev.inventory };
      if (isWeapon) {
        newInventory.weapons = [...newInventory.weapons, item as Weapon];
      } else {
        newInventory.armor = [...newInventory.armor, item as Armor];
      }

      return {
        ...prev,
        coins: prev.coins - cost,
        inventory: newInventory,
        statistics: {
          ...prev.statistics,
          chestsOpened: prev.statistics.chestsOpened + 1
        }
      };
    });

    return {
      type: isWeapon ? 'weapon' : 'armor',
      items: [item]
    };
  }, [gameState]);

  const startCombat = useCallback(() => {
    if (!gameState) return;
    
    const enemy = generateEnemy(gameState.zone);
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentEnemy: enemy,
        inCombat: true,
        combatLog: [`You encounter a ${enemy.name}!`]
      };
    });
  }, [gameState]);

  const attack = useCallback((hit: boolean, category?: string) => {
    if (!gameState || !gameState.currentEnemy) return;

    setGameState(prev => {
      if (!prev || !prev.currentEnemy) return prev;

      let newCombatLog = [...prev.combatLog];
      let newEnemy = { ...prev.currentEnemy };
      let newPlayerStats = { ...prev.playerStats };
      let newCoins = prev.coins;
      let newGems = prev.gems;
      let newZone = prev.zone;
      let inCombat = true;

      if (hit) {
        const damage = Math.max(1, prev.playerStats.atk - newEnemy.def);
        newEnemy.hp = Math.max(0, newEnemy.hp - damage);
        newCombatLog.push(`You deal ${damage} damage!`);

        if (newEnemy.hp <= 0) {
          const coinReward = Math.floor(10 + prev.zone * 2);
          const gemReward = Math.floor(Math.random() * 3) + 1;
          
          newCoins += coinReward;
          newGems += gemReward;
          newZone += 1;
          inCombat = false;
          
          newCombatLog.push(`${newEnemy.name} defeated! +${coinReward} coins, +${gemReward} gems`);
        }
      } else {
        const damage = Math.max(1, newEnemy.atk - prev.playerStats.def);
        newPlayerStats.hp = Math.max(0, newPlayerStats.hp - damage);
        newCombatLog.push(`${newEnemy.name} deals ${damage} damage to you!`);

        if (newPlayerStats.hp <= 0) {
          newCombatLog.push('You have been defeated!');
          inCombat = false;
        }
      }

      return {
        ...prev,
        currentEnemy: newEnemy.hp > 0 ? newEnemy : null,
        playerStats: newPlayerStats,
        coins: newCoins,
        gems: newGems,
        zone: newZone,
        inCombat,
        combatLog: newCombatLog.slice(-10)
      };
    });
  }, [gameState]);

  // Placeholder functions for missing functionality
  const exchangeShinyGems = useCallback((amount: number): boolean => {
    if (!gameState || gameState.shinyGems < amount) return false;
    
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        shinyGems: prev.shinyGems - amount,
        gems: prev.gems + (amount * 10)
      };
    });
    return true;
  }, [gameState]);

  const mineGem = useCallback((x: number, y: number) => {
    const isShiny = Math.random() < 0.05;
    const gems = isShiny ? 0 : 1;
    const shinyGems = isShiny ? 1 : 0;

    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        gems: prev.gems + gems,
        shinyGems: prev.shinyGems + shinyGems,
        mining: {
          totalGemsMined: prev.mining.totalGemsMined + gems,
          totalShinyGemsMined: prev.mining.totalShinyGemsMined + shinyGems
        }
      };
    });

    return { gems, shinyGems };
  }, []);

  const discardItem = useCallback((itemId: string, type: 'weapon' | 'armor') => {
    setGameState(prev => {
      if (!prev) return prev;
      
      if (type === 'weapon') {
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            weapons: prev.inventory.weapons.filter(w => w.id !== itemId)
          }
        };
      } else {
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            armor: prev.inventory.armor.filter(a => a.id !== itemId)
          }
        };
      }
    });
  }, []);

  // Placeholder functions that return false/empty for removed features
  const claimDailyReward = useCallback(() => false, []);
  const upgradeSkill = useCallback(() => false, []);
  const prestige = useCallback(() => false, []);
  const claimOfflineRewards = useCallback(() => {}, []);
  const bulkSell = useCallback(() => {}, []);
  const bulkUpgrade = useCallback(() => {}, []);
  const updateSettings = useCallback(() => {}, []);
  const addCoins = useCallback(() => {}, []);
  const addGems = useCallback(() => {}, []);
  const teleportToZone = useCallback(() => {}, []);
  const setExperience = useCallback(() => {}, []);
  const rollSkill = useCallback(() => false, []);
  const resetGame = useCallback(() => {
    const newState = createInitialGameState();
    newState.auctionHouse.items = generateAuctionItems();
    setGameState(newState);
  }, []);
  const setGameMode = useCallback(() => {}, []);
  const toggleCheat = useCallback(() => {}, []);
  const generateCheatItem = useCallback(() => {}, []);
  const purchaseMythical = useCallback(() => null, []);
  const selectAdventureSkill = useCallback(() => {}, []);
  const skipAdventureSkills = useCallback(() => {}, []);
  const useSkipCard = useCallback(() => {}, []);

  return {
    gameState,
    isLoading,
    equipWeapon,
    equipArmor,
    upgradeWeapon,
    upgradeArmor,
    sellWeapon,
    sellArmor,
    openChest,
    purchaseMythical,
    startCombat,
    attack,
    resetGame,
    setGameMode,
    toggleCheat,
    generateCheatItem,
    mineGem,
    exchangeShinyGems,
    discardItem,
    claimDailyReward,
    upgradeSkill,
    prestige,
    claimOfflineRewards,
    bulkSell,
    bulkUpgrade,
    updateSettings,
    addCoins,
    addGems,
    teleportToZone,
    setExperience,
    rollSkill,
    selectAdventureSkill,
    skipAdventureSkills,
    useSkipCard,
    purchaseAuctionItem,
    listAuctionItem,
  };
};