import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #1a1e23;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00c74d;
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

const Username = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #ff5555;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #ff3333;
  }
`;

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <HeaderContainer>
      <Logo>Online Casino</Logo>
      
      {user && (
        <UserInfo>
          <Username>
            <FontAwesomeIcon icon={faUser} />
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
      )}
    </HeaderContainer>
  );
};

export default Header; 