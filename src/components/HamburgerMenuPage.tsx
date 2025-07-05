import React, { useState } from 'react';
import { Gavel, BarChart3, Trophy, TrendingUp, Settings, ArrowLeft, Code, Zap } from 'lucide-react';
import { Statistics } from './Statistics';
import { Achievements } from './Achievements';
import { ProgressionPanel } from './ProgressionPanel';
import { GameSettings } from './GameSettings';
import { DevTools } from './DevTools';
import { Skills } from './Skills';
import { AuctionHouse } from './AuctionHouse';
import { GameState, GameSettings as SettingsType } from '../types/game';

interface HamburgerMenuPageProps {
  gameState: GameState;
  onUpgradeSkill: (skillId: string) => boolean;
  onPrestige: () => boolean;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onAddCoins: (amount: number) => void;
  onAddGems: (amount: number) => void;
  onTeleportToZone: (zone: number) => void;
  onSetExperience: (xp: number) => void;
  onRollSkill: () => boolean;
  onPurchaseAuctionItem: (itemId: string) => boolean;
  onListAuctionItem: (item: any, price: number) => boolean;
  onBack: () => void;
}

export const HamburgerMenuPage: React.FC<HamburgerMenuPageProps> = ({
  gameState,
  onUpgradeSkill,
  onPrestige,
  onUpdateSettings,
  onAddCoins,
  onAddGems,
  onTeleportToZone,
  onSetExperience,
  onRollSkill,
  onPurchaseAuctionItem,
  onListAuctionItem,
  onBack
}) => {
  const [activeSection, setActiveSection] = useState<'auction' | 'stats' | 'achievements' | 'progression' | 'settings' | 'devtools' | 'skills' | null>(null);

  const menuItems = [
    {
      id: 'auction',
      name: 'Auction House',
      icon: Gavel,
      color: 'text-indigo-400',
      bgColor: 'from-indigo-900/50 to-purple-900/50',
      borderColor: 'border-indigo-500/50',
      description: 'Buy and sell items with other players',
      status: `${gameState.auctionHouse.items.length} items available`
    },
    {
      id: 'skills',
      name: 'Menu Skills',
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'from-purple-900/50 to-indigo-900/50',
      borderColor: 'border-purple-500/50',
      description: 'Roll for powerful temporary abilities',
      status: gameState.skills?.activeMenuSkill ? `${gameState.skills.activeMenuSkill.name} active` : 'No active skill'
    },
    {
      id: 'stats',
      name: 'Statistics',
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'from-blue-900/50 to-indigo-900/50',
      borderColor: 'border-blue-500/50',
      description: 'View your detailed game statistics',
      status: `${Math.round((gameState.statistics.correctAnswers / Math.max(gameState.statistics.totalQuestionsAnswered, 1)) * 100)}% accuracy`
    },
    {
      id: 'achievements',
      name: 'Achievements',
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-900/50 to-orange-900/50',
      borderColor: 'border-yellow-500/50',
      description: 'Track your progress and unlock rewards',
      status: `${gameState.achievements.filter(a => a.unlocked).length}/${gameState.achievements.length} unlocked`
    },
    {
      id: 'progression',
      name: 'Character Progress',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'from-purple-900/50 to-indigo-900/50',
      borderColor: 'border-purple-500/50',
      description: 'Level up and unlock new skills',
      status: `Level ${gameState.progression.level} (${gameState.progression.skillPoints} SP)`
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      color: 'text-gray-400',
      bgColor: 'from-gray-900/50 to-slate-900/50',
      borderColor: 'border-gray-500/50',
      description: 'Customize your game experience',
      status: `${gameState.settings.language.toUpperCase()} | ${gameState.settings.darkMode ? 'Dark' : 'Light'} mode`
    },
    {
      id: 'devtools',
      name: 'Developer Tools',
      icon: Code,
      color: 'text-green-400',
      bgColor: 'from-gray-900/50 to-black/50',
      borderColor: 'border-green-500/50',
      description: 'Debug and testing utilities',
      status: 'Restricted access'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'auction':
        return (
          <AuctionHouse
            auctionHouse={gameState.auctionHouse}
            coins={gameState.coins}
            gems={gameState.gems}
            inventory={gameState.inventory}
            onPurchaseItem={onPurchaseAuctionItem}
            onListItem={onListAuctionItem}
            onClose={() => setActiveSection(null)}
            nextRefresh={gameState.auctionHouse.nextRefresh}
          />
        );
      case 'skills':
        return (
          <Skills
            skills={gameState.skills}
            coins={gameState.coins}
            onRollSkill={onRollSkill}
            onClose={() => setActiveSection(null)}
          />
        );
      case 'stats':
        return (
          <Statistics
            statistics={gameState.statistics}
            onClose={() => setActiveSection(null)}
          />
        );
      case 'achievements':
        return (
          <Achievements
            achievements={gameState.achievements}
            onClose={() => setActiveSection(null)}
          />
        );
      case 'progression':
        return (
          <ProgressionPanel
            progression={gameState.progression}
            onUpgradeSkill={onUpgradeSkill}
            onPrestige={onPrestige}
            onClose={() => setActiveSection(null)}
          />
        );
      case 'settings':
        return (
          <GameSettings
            settings={gameState.settings}
            onUpdateSettings={onUpdateSettings}
            onClose={() => setActiveSection(null)}
          />
        );
      case 'devtools':
        return (
          <DevTools
            onAddCoins={onAddCoins}
            onAddGems={onAddGems}
            onTeleportToZone={onTeleportToZone}
            onSetExperience={onSetExperience}
            onClose={() => setActiveSection(null)}
          />
        );
      default:
        return null;
    }
  };

  // If a section is active, render it
  if (activeSection) {
    return renderSection();
  }

  // Main menu page
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">🍔 Game Menu</h1>
        <p className="text-gray-300 text-sm sm:text-base">Access special features and advanced settings</p>
      </div>

      {/* Menu Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`p-3 sm:p-4 md:p-6 bg-gradient-to-br ${item.bgColor} rounded-lg border-2 ${item.borderColor} hover:scale-105 transition-all duration-200 text-left group shadow-lg`}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${item.color} group-hover:scale-110 transition-transform`} />
                <h3 className="text-white font-bold text-sm sm:text-base md:text-lg">{item.name}</h3>
              </div>
              
              <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">{item.description}</p>
              
              <div className="bg-black/30 p-2 rounded-lg">
                <p className={`text-xs font-semibold ${item.color}`}>{item.status}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-black/30 p-4 sm:p-6 rounded-lg border border-gray-600/50">
        <h3 className="text-white font-bold text-base sm:text-lg mb-4">📊 Quick Overview</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">Zone</p>
            <p className="text-white text-lg sm:text-xl font-bold">{gameState.zone}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">Level</p>
            <p className="text-white text-lg sm:text-xl font-bold">{gameState.progression.level}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">Accuracy</p>
            <p className="text-white text-lg sm:text-xl font-bold">
              {Math.round((gameState.statistics.correctAnswers / Math.max(gameState.statistics.totalQuestionsAnswered, 1)) * 100)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">Achievements</p>
            <p className="text-white text-lg sm:text-xl font-bold">
              {gameState.achievements.filter(a => a.unlocked).length}/{gameState.achievements.length}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-xs sm:text-sm">
        <p>💡 Tip: Each section contains detailed information and management tools!</p>
      </div>
    </div>
  );
};