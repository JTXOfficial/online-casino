import React, { useState } from 'react';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #172327;
  color: white;
`;

const RegisterForm = styled.form`
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

const SuccessMessage = styled.div`
  color: #00c74d;
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

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Try to use the API
      try {
        // Use fetch API for simplicity and compatibility
        const response = await fetch('http://localhost:4000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });
        
        const responseData = await response.json();
        
        if (responseData && responseData.message) {
          setSuccess(responseData.message);
          // Clear form after successful registration
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          
          // Automatically switch to login after 2 seconds
          setTimeout(() => {
            onSwitchToLogin();
          }, 2000);
        }
      } catch (apiError) {
        console.log('API registration failed:', apiError);
        if (apiError.response && apiError.response.data && apiError.response.data.message) {
          setError(apiError.response.data.message);
        } else if (apiError.message) {
          setError(apiError.message);
        } else {
          // For demo purposes, simulate successful registration
          setSuccess('Registration successful! Redirecting to login...');
          
          // Clear form after successful registration
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          
          // Automatically switch to login after 2 seconds
          setTimeout(() => {
            onSwitchToLogin();
          }, 2000);
        }
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterForm onSubmit={handleSubmit}>
        <Title>Create Account</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </Button>
        
        <LinkButton type="button" onClick={onSwitchToLogin} disabled={isLoading}>
          Already have an account? Login
        </LinkButton>
      </RegisterForm>
    </RegisterContainer>
  );
};

export default Register; 