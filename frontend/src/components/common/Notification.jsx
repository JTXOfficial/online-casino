import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  background-color: ${props => {
    switch(props.type) {
      case 'win': return '#00c74d';
      case 'loss': return '#ff5555';
      case 'error': return '#ff5555';
      default: return '#2196f3';
    }
  }};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s, transform 0.3s;
  transform: ${props => props.visible 
    ? 'translate(-50%, 0)' 
    : 'translate(-50%, -20px)'};
`;

const Notification = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for fade out animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <NotificationContainer type={type} visible={visible}>
      {message}
    </NotificationContainer>
  );
};

export default Notification; 