import React, { useState } from 'react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #172327;
  color: white;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 30px;
  background-color: #1a1e23;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: white;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 15px;
  border: none;
  border-radius: 5px;
  background-color: #2c3136;
  color: white;
  font-size: 16px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #00c74d;
  }
`;

const Button = styled.button`
  padding: 12px;
  background-color: #00c74d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #00a040;
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff5555;
  margin-bottom: 15px;
  text-align: center;
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #00c74d;
  cursor: pointer;
  font-size: 14px;
  margin-top: 15px;
  text-decoration: underline;
  
  &:hover {
    color: #00a040;
  }
`;

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use fetch API for authentication
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid username or password');
      }
      
      const userData = await response.json();
      
      if (userData && userData.id) {
        console.log("Login successful:", userData);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Call the onLogin callback with user data
        onLogin(userData);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Casino Login</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        
        {onSwitchToRegister && (
          <LinkButton type="button" onClick={onSwitchToRegister} disabled={isLoading}>
            Don't have an account? Register
          </LinkButton>
        )}
      </LoginForm>
    </LoginContainer>
  );
};

export default Login; 