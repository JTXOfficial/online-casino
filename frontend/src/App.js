import React, { useState } from 'react';
import Roulette from './components/roulette/roulette';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Header from './components/layout/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #172327;
`;

// Main app content that depends on authentication
const AppContent = () => {
  const { isAuthenticated, loading, login, updateBalance } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        Loading...
      </div>
    );
  }

  const switchToLogin = () => setAuthMode('login');
  const switchToRegister = () => setAuthMode('register');

  return (
    <AppContainer>
      <Header />
      
      {isAuthenticated ? (
        <Roulette />
      ) : (
        <>
          {authMode === 'login' ? (
            <Login onLogin={login} onSwitchToRegister={switchToRegister} />
          ) : (
            <Register onSwitchToLogin={switchToLogin} />
          )}
        </>
      )}
    </AppContainer>
  );
};

// Root App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
