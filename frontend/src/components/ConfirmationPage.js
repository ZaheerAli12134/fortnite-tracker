import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  saveTracking: async (trackingData) => {
    try {
      const response = await fetch(`${API_BASE}/trackings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(trackingData)
      });
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }
};

const ConfirmationPage = ({ cosmetic, onSubmit, onBack }) => {
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cosmeticDetails, setCosmeticDetails] = useState(cosmetic);

  useEffect(() => {
    setCosmeticDetails(cosmetic);
  }, [cosmetic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactInfo.trim()) return;

    setIsSubmitting(true);
    
    try {
      const result = await api.saveTracking({
        cosmetic: cosmeticDetails,
        contactInfo,
        notificationMethod: 'email'
      });
      
      if (result.success) {
        onSubmit({
          cosmetic: cosmeticDetails,
          notificationMethod: 'email',
          contactInfo,
          trackingId: result.trackingId,
          timestamp: new Date().toISOString()
        });
      } else {
        alert('Failed to setup tracking: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error. Please check if backend is running on localhost:5000');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLastSeenText = () => {
    const daysAgo = cosmeticDetails.lastSeen || 30;
    if (daysAgo === 0) return 'Currently in shop';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
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
        <button className="btn btn-secondary mb-2" onClick={onBack}>
          ← Back to Search
        </button>
        
        <h1 className="text-center mb-2">Confirm Your Selection</h1>
        
        <div className="confirmation-content">
          <div className="cosmetic-details">
            <h2 className="mb-1">{cosmeticDetails.name}</h2>
            
            <div className="cosmetic-image">
              {cosmeticDetails.imageUrl ? (
                <img 
                  src={cosmeticDetails.imageUrl} 
                  alt={cosmeticDetails.name}
                  style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem'}}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                display: cosmeticDetails.imageUrl ? 'none' : 'flex',
                width: '100%', 
                height: '100%', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '3rem'
              }}>
                {getTypeIcon(cosmeticDetails.type)}
              </div>
            </div>
            
            {cosmeticDetails.description && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                {cosmeticDetails.description}
              </div>
            )}
            
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value" style={{textTransform: 'capitalize'}}>
                {cosmeticDetails.type}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rarity:</span>
              <span className={`detail-value rarity-${cosmeticDetails.rarity}`}>
                {cosmeticDetails.rarityName || cosmeticDetails.rarity}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Seen:</span>
              <span className="detail-value">{getLastSeenText()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">VBucks Cost:</span>
              <span className="detail-value">{cosmeticDetails.price || '800'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Season Released:</span>
              <span className="detail-value">{cosmeticDetails.introduction || 'Unknown'}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-1">Set Up Email Notifications</h3>
            <p className="mb-2">
              We'll notify you via email as soon as <strong>{cosmeticDetails.name}</strong> returns to the item shop.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="notification-options">
                <div className="notification-option selected">
                  <div className="option-icon">📧</div>
                  <div className="option-title">Email</div>
                  <div className="option-description">Get email notifications</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={isSubmitting || !contactInfo.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading"></div>
                    Setting up notifications...
                  </>
                ) : (
                  'Confirm & Set Up Notifications'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;