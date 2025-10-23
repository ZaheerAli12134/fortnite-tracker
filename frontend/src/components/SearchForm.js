import React, { useState } from 'react';
import { searchCosmetics } from '../utils/fortniteData';

const SearchForm = ({ onCosmeticSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cosmeticType, setCosmeticType] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError('');
    
    try {
      const results = await searchCosmetics(searchTerm, cosmeticType);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No cosmetics found. Try a different search term.');
      }
    } catch (err) {
      setError('Failed to search cosmetics. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCosmeticClick = (cosmetic) => {
    onCosmeticSelect(cosmetic);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'skin': return '👤';
      case 'emote': return '💃';
      case 'pickaxe': return '⛏️';
      case 'backbling': return '🎒';
      default: return '🎮';
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-center mb-2">Track Your Favorite Fortnite Cosmetics</h1>
        <p className="text-center mb-2">
          Get notified via email or SMS when your desired skins, emotes, or pickaxes return to the item shop!
        </p>

        {process.env.FN_API_KEY === 'api-key' && (
          <div className="notification-option" style={{background: 'rgba(243, 156, 18, 0.1)', borderColor: 'var(--warning)'}}>
            <div className="option-icon">⚠️</div>
            <div className="option-title">API Key Required</div>
            <div className="option-description">
              Using mock data. Get your free API key from fortniteapi.io and add it to your environment variables.
            </div>
          </div>
        )}
        
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label className="form-label">Search for Cosmetic</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter cosmetic name (e.g., Renegade Raider, Floss, Reaper...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              minLength={2}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Cosmetic Type</label>
            <select
              className="form-select"
              value={cosmeticType}
              onChange={(e) => setCosmeticType(e.target.value)}
            >   
              <option value="all">All Types</option>
              <option value="skin">Skins</option>
              <option value="emote">Emotes</option>
              <option value="pickaxe">Pickaxes</option>
              <option value="backbling">Back Blings</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isSearching || !searchTerm.trim()}>
            {isSearching ? <div className="loading"></div> : 'Search Cosmetics'}
            {isSearching && ' Searching...'}
          </button>
        </form>

        {error && (
          <div className="text-center mt-2" style={{color: 'var(--secondary)'}}>
            <p>{error}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="search-results mt-2">
            {searchResults.map((cosmetic) => (
              <div
                key={cosmetic.id}
                className="cosmetic-item"
                onClick={() => handleCosmeticClick(cosmetic)}
              >
                <div className="cosmetic-image">
                  {cosmetic.imageUrl ? (
                    <img 
                      src={cosmetic.imageUrl} 
                      alt={cosmetic.name}
                      style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem'}}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{
                    display: cosmetic.imageUrl ? 'none' : 'flex',
                    width: '100%', 
                    height: '100%', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '3rem'
                  }}>
                    {getTypeIcon(cosmetic.type)}
                  </div>
                </div>
                <div className="cosmetic-name">{cosmetic.name}</div>
                <div className="cosmetic-type">{cosmetic.type}</div>
                {cosmetic.description && (
                  <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem'}}>
                    {cosmetic.description}
                  </div>
                )}
                <div className={`cosmetic-rarity rarity-${cosmetic.rarity}`}>
                  {cosmetic.rarityName || cosmetic.rarity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchForm;