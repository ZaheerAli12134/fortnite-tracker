import React from 'react';

const SuccessPage = ({ cosmetic, userData, onBack }) => {
  return (
    <div className="container">
      <div className="card success-content">
        <div className="success-icon">✅</div>
        <h1 className="success-title">Notifications Set Up Successfully!</h1>
        
        <div className="success-message">
          <p>We'll notify you at <strong>{userData.contactInfo}</strong></p>
          <p>when <strong>{cosmetic.name}</strong> returns to the Fortnite item shop.</p>
        </div>

        <div className="cosmetic-details mb-2">
          <h3 className="mb-1">Your Tracking Details</h3>
          <div className="detail-item">
            <span className="detail-label">Cosmetic:</span>
            <span className="detail-value">{cosmetic.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Notification Method:</span>
            <span className="detail-value">
              {userData.notificationMethod === 'email' ? 'Email' : 'SMS'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Contact:</span>
            <span className="detail-value">{userData.contactInfo}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tracking Started:</span>
            <span className="detail-value">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="mb-1">
            💡 <strong>Pro Tip:</strong> You can track multiple cosmetics by searching again!
          </p>
          <button className="btn btn-primary" onClick={onBack}>
            Track Another Cosmetic
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;