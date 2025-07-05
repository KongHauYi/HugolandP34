import React, { useState, useEffect } from 'react';
import { AuctionHouse as AuctionHouseType, AuctionItem, Weapon, Armor } from '../types/game';
import { Gavel, Coins, Clock, X, Sword, Shield, Search, Plus } from 'lucide-react';
import { getRarityColor, getRarityBorder } from '../utils/gameUtils';

interface AuctionHouseProps {
  auctionHouse: AuctionHouseType;
  coins: number;
  gems: number;
  inventory: { weapons: Weapon[]; armor: Armor[] };
  onPurchaseItem: (itemId: string) => boolean;
  onListItem: (item: Weapon | Armor, price: number) => boolean;
  onClose: () => void;
  nextRefresh: Date;
}

export const AuctionHouse: React.FC<AuctionHouseProps> = ({
  auctionHouse,
  coins,
  gems,
  inventory,
  onPurchaseItem,
  onListItem,
  onClose,
  nextRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'listings'>('buy');
  const [selectedItem, setSelectedItem] = useState<Weapon | Armor | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary' | 'mythical'>('all');
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const refreshTime = new Date(nextRefresh).getTime();
      const timeDiff = Math.max(0, refreshTime - now);
      setTimeUntilRefresh(timeDiff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRefresh]);

  const minutesLeft = Math.floor(timeUntilRefresh / 60000);
  const secondsLeft = Math.floor((timeUntilRefresh % 60000) / 1000);

  const filteredItems = auctionHouse.items.filter(auctionItem => {
    const item = auctionItem.item;
    const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  const handlePurchase = (auctionItem: AuctionItem) => {
    const success = onPurchaseItem(auctionItem.id);
    if (success) {
      // Item purchased successfully
    } else {
      alert('Not enough coins!');
    }
  };

  const handleListItem = () => {
    if (!selectedItem || !listingPrice) return;
    
    const price = parseInt(listingPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price!');
      return;
    }

    const success = onListItem(selectedItem, price);
    if (success) {
      setSelectedItem(null);
      setListingPrice('');
      setActiveTab('listings');
    } else {
      alert('Failed to list item!');
    }
  };

  const getTimeRemainingColor = (hours: number) => {
    if (hours > 12) return 'text-green-400';
    if (hours > 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4 sm:p-6 rounded-lg border-2 border-indigo-500/50 max-w-6xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Gavel className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
            <div>
              <h2 className="text-white font-bold text-lg sm:text-xl">🏛️ Auction House</h2>
              <p className="text-indigo-300 text-sm">Buy and Sell Items with Other Players</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-black/30 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Coins: {coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">
                  Refresh: {minutesLeft}m {secondsLeft}s
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                Items: {auctionHouse.items.length} available | Your Listings: {auctionHouse.playerListings.length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'buy', label: 'Buy Items', icon: Coins },
            { key: 'sell', label: 'Sell Items', icon: Plus },
            { key: 'listings', label: 'My Listings', icon: Gavel }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Buy Tab */}
        {activeTab === 'buy' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none text-sm"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
                <option value="mythical">Mythical</option>
              </select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((auctionItem) => {
                const item = auctionItem.item;
                const canAfford = coins >= auctionItem.price;
                const timeColor = getTimeRemainingColor(auctionItem.timeRemaining);

                return (
                  <div
                    key={auctionItem.id}
                    className={`p-4 rounded-lg border-2 ${getRarityBorder(item.rarity)} bg-black/40 hover:bg-black/60 transition-all`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {'baseAtk' in item ? (
                        <Sword className="w-4 h-4 text-orange-400" />
                      ) : (
                        <Shield className="w-4 h-4 text-blue-400" />
                      )}
                      <h3 className={`font-semibold text-sm ${getRarityColor(item.rarity)}`}>
                        {item.name}
                      </h3>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-white text-sm">
                        {'baseAtk' in item ? `ATK: ${item.baseAtk}` : `DEF: ${item.baseDef}`}
                      </p>
                      <p className="text-gray-300 text-xs">Level {item.level}</p>
                      <p className="text-gray-300 text-xs">
                        Durability: {item.durability}/{item.maxDurability}
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-yellow-400">Price: {auctionItem.price}</span>
                        <span className={timeColor}>{auctionItem.timeRemaining}h left</span>
                      </div>
                      <p className="text-gray-400 text-xs">Seller: {auctionItem.seller}</p>
                    </div>

                    <button
                      onClick={() => handlePurchase(auctionItem)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg font-semibold transition-all text-sm ${
                        canAfford
                          ? 'bg-green-600 text-white hover:bg-green-500'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Buy Now' : 'Cannot Afford'}
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <Gavel className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No items found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters or check back after refresh!</p>
              </div>
            )}
          </div>
        )}

        {/* Sell Tab */}
        {activeTab === 'sell' && (
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Select an item to sell</h3>
            
            {/* Item Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {[...inventory.weapons, ...inventory.armor].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedItem?.id === item.id
                      ? 'border-blue-500 bg-blue-900/30'
                      : `${getRarityBorder(item.rarity)} bg-black/20 hover:bg-black/40`
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {'baseAtk' in item ? (
                      <Sword className="w-4 h-4 text-orange-400" />
                    ) : (
                      <Shield className="w-4 h-4 text-blue-400" />
                    )}
                    <span className={`font-semibold text-sm ${getRarityColor(item.rarity)}`}>
                      {item.name}
                    </span>
                  </div>
                  <p className="text-white text-sm">
                    {'baseAtk' in item ? `ATK: ${item.baseAtk}` : `DEF: ${item.baseDef}`}
                  </p>
                  <p className="text-gray-300 text-xs">Level {item.level}</p>
                </button>
              ))}
            </div>

            {/* Listing Interface */}
            {selectedItem && (
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="text-white font-bold mb-3">List "{selectedItem.name}" for Sale</h4>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-gray-300 text-sm mb-2">Price (coins)</label>
                    <input
                      type="number"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      placeholder="Enter price..."
                      className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleListItem}
                    disabled={!listingPrice}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      listingPrice
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    List Item
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Suggested price: {selectedItem.sellPrice * 2} coins (Items listed for 24 hours)
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              Your Active Listings ({auctionHouse.playerListings.length})
            </h3>
            
            {auctionHouse.playerListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {auctionHouse.playerListings.map((auctionItem) => {
                  const item = auctionItem.item;
                  const timeColor = getTimeRemainingColor(auctionItem.timeRemaining);

                  return (
                    <div
                      key={auctionItem.id}
                      className={`p-4 rounded-lg border-2 ${getRarityBorder(item.rarity)} bg-black/40`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {'baseAtk' in item ? (
                          <Sword className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-blue-400" />
                        )}
                        <h3 className={`font-semibold text-sm ${getRarityColor(item.rarity)}`}>
                          {item.name}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <p className="text-white text-sm">
                          {'baseAtk' in item ? `ATK: ${item.baseAtk}` : `DEF: ${item.baseDef}`}
                        </p>
                        <p className="text-gray-300 text-xs">Level {item.level}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-400">Price: {auctionItem.price}</span>
                          <span className={timeColor}>{auctionItem.timeRemaining}h left</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plus className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No active listings</p>
                <p className="text-gray-500 text-sm">Use the "Sell Items" tab to list items for sale!</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🏛️ The Auction House: Where adventurers trade their finest gear.</p>
          <p>Items refresh every 5 minutes • Listings expire after 24 hours</p>
        </div>
      </div>
    </div>
  );
};