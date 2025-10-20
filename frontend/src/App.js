import React, { useState } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ConfirmationPage from './components/ConfirmationPage';
import SuccessPage from './components/SuccessPage';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('search');
  const [selectedCosmetic, setSelectedCosmetic] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleCosmeticSelect = (cosmetic) => {
    setSelectedCosmetic(cosmetic);
    setCurrentPage('confirmation');
  };

  const handleNotificationSubmit = (data) => {
    setUserData(data);
    setCurrentPage('success');
  };

  const handleBackToSearch = () => {
    setCurrentPage('search');
    setSelectedCosmetic(null);
  };

  return (
    <div className="App">
      <Header />
      
      <main className="main-content">
        {currentPage === 'search' && (
          <SearchForm onCosmeticSelect={handleCosmeticSelect} />
        )}
        {currentPage === 'confirmation' && (
          <ConfirmationPage
            cosmetic={selectedCosmetic}
            onSubmit={handleNotificationSubmit}
            onBack={handleBackToSearch}
          />
        )}
        {currentPage === 'success' && (
          <SuccessPage
            cosmetic={selectedCosmetic}
            userData={userData}
            onBack={handleBackToSearch}
          />
        )}
      </main>

      {!process.env.REACT_APP_FN_API_KEY && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          background: 'rgba(255,0,0,0.9)',
          color: 'white',
          padding: '1rem',
          textAlign: 'center',
          zIndex: 1000
        }}>
          ⚠️ API Key Missing: Create a .env file with REACT_APP_FN_API_KEY=your_key_here
        </div>
      )}
    </div>
  );
}

export default App;