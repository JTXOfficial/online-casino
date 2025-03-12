import React, { useState } from 'react';
import styled from 'styled-components';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthContainer = styled.div`
  min-height: 100vh;
  background-color: #172327;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const AuthCard = styled.div`
  background-color: #1a1e23;
  border-radius: 8px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const switchToLogin = () => setAuthMode('login');
  const switchToRegister = () => setAuthMode('register');

  const handleLogin = (userData) => {
    login(userData);
    navigate('/');
  };

  return (
    <AuthContainer>
      <AuthCard>
        {authMode === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        ) : (
          <Register onSwitchToLogin={switchToLogin} />
        )}
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthPage; 