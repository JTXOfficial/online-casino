import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faSignOutAlt, faUser, faSignInAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #1a1e23;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00c74d;
  text-decoration: none;
  
  &:hover {
    color: #00e359;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Balance = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #2c3136;
  padding: 8px 12px;
  border-radius: 5px;
  font-weight: bold;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #2c3136;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Username = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  text-decoration: none;
  
  &:hover {
    color: #00c74d;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const LogoutButton = styled(Button)`
  background-color: #ff5555;
  
  &:hover {
    background-color: #ff3333;
  }
`;

const LoginButton = styled(Button)`
  background-color: #00c74d;
  
  &:hover {
    background-color: #00e359;
  }
`;

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    navigate('/auth');
  };
  
  return (
    <HeaderContainer>
      <Logo to="/">Online Casino</Logo>
      
      {isAuthenticated ? (
        <UserInfo>
          <Username to="/profile">
            {user.profilePicture ? (
              <UserAvatar>
                <img src={`http://localhost:4000${user.profilePicture}`} alt="Profile" />
              </UserAvatar>
            ) : (
              <FontAwesomeIcon icon={faUserCircle} />
            )}
            {user.username}
          </Username>
          
          <Balance>
            <FontAwesomeIcon icon={faCoins} style={{ color: 'gold' }} />
            {user.balance.toFixed(2)}
          </Balance>
          
          <LogoutButton onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </LogoutButton>
        </UserInfo>
      ) : (
        <UserInfo>
          <LoginButton onClick={handleLoginClick}>
            <FontAwesomeIcon icon={faSignInAlt} />
            Login
          </LoginButton>
        </UserInfo>
      )}
    </HeaderContainer>
  );
};

export default Header; 