import React from 'react';
import styled from 'styled-components';
import Roulette from '../components/roulette/roulette';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomeContainer = styled.div`
  min-height: 100vh;
  background-color: #172327;
`;

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const openAuthModal = () => {
    navigate('/auth');
  };

  return (
    <HomeContainer>
      <Roulette isAuthenticated={isAuthenticated} openAuthModal={openAuthModal} />
    </HomeContainer>
  );
};

export default HomePage; 