import React, { useState, useEffect } from "react";
import styled from 'styled-components'
import RouletteGame from "./rouletteGame";
import io from 'socket.io-client'
import RouletteBetting from "./rouletteBetting";
import { useAuth } from "../../context/AuthContext";
import Notification from "../common/Notification";

const ENDPOINT = 'http://localhost:4000/roulette';

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #172327;
`;

const ConnectionStatus = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  background-color: ${props => props.connected ? '#00c74d' : '#ff5555'};
`;

function Roulette() {
  const { user, updateBalance } = useAuth();
  const [state, setState] = useState({
    countdown: 0,
    active: false,
    winningColor: null,
    bets: [],
    marginLeft: 0,
  });
  
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    console.log("Connecting to socket at:", ENDPOINT);
    
    // Create socket with explicit connection options
    const newSocket = io(ENDPOINT, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log("Socket connected successfully with ID:", newSocket.id);
      setConnected(true);
      setConnectionError(null);
      
      // Request initial state immediately after connection
      newSocket.emit('getState');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error("Socket connection error:", error.message);
      setConnected(false);
      setConnectionError(error.message);
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log("Socket disconnected:", reason);
      setConnected(false);
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setConnected(true);
      setConnectionError(null);
      
      // Request state again after reconnection
      newSocket.emit('getState');
    });
    
    newSocket.on('reconnect_error', (error) => {
      console.error("Socket reconnection error:", error.message);
      setConnectionError(`Reconnection failed: ${error.message}`);
    });
    
    setSocket(newSocket);

    // Clean up socket connection when component unmounts
    return () => {
      console.log("Component unmounting, disconnecting socket");
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    console.log("Setting up socket listeners");
    
    const handleSync = (data) => {
      console.log("Socket 'sync' event received:", data);
      
      // Ensure countdownStarted is a number and valid
      let countdown = 0;
      if (typeof data.countdownStarted === 'number' && !isNaN(data.countdownStarted)) {
        countdown = Math.max(0, data.countdownStarted);
      }
      
      console.log(`Setting countdown to: ${countdown}, active: ${data.active}`);
      
      setState(prevState => ({
        ...prevState,
        countdown: countdown,
        active: data.active,
        bets: data.bets || [],
        marginLeft: data.marginLeft || 0,
      }));
    };

    const handleRoll = (data) => {
      console.log("Socket 'roll' event received:", data);
      setState(prevState => ({
        ...prevState,
        winningColor: data.color,
        active: true,
        countdown: 0, // Explicitly set countdown to 0 during roll
        marginLeft: data.marginLeft || 0,
      }));
    };

    const handleNewBet = (data) => {
      console.log("New bets received:", data);
      setState(prevState => ({
        ...prevState,
        bets: data,
      }));
    };

    const handleBetResponse = (data) => {
      console.log("Bet response received:", data);
      if (data.balance !== undefined) {
        console.log("Updating balance to:", data.balance);
        updateBalance(data.balance);
        
        // Show a notification about the balance update
        if (data.success && data.message && data.message.includes('won')) {
          // Display win notification
          console.log("You won! Your new balance is:", data.balance);
          setNotification({
            message: data.message,
            type: 'win',
            duration: 5000 // Longer duration for win notifications
          });
        } else if (data.message && data.message.includes('lost')) {
          // Display loss notification
          console.log("You lost. Your new balance is:", data.balance);
          setNotification({
            message: data.message,
            type: 'loss',
            duration: 4000 // Standard duration for loss notifications
          });
        } else if (data.message && data.message.includes('Bet Placed')) {
          // Display bet placed notification
          console.log("Bet placed successfully. Your new balance is:", data.balance);
          setNotification({
            message: 'Bet placed successfully',
            type: 'info',
            duration: 2000 // Shorter duration for bet placed notifications
          });
        }
      } else {
        console.log(data.message);
        if (data.message) {
          setNotification({
            message: data.message,
            type: 'error',
            duration: 4000 // Standard duration for error notifications
          });
        }
      }
    };

    socket.on('sync', handleSync);
    socket.on('roll', handleRoll);
    socket.on('newBet', handleNewBet);
    socket.on('betResponse', handleBetResponse);

    // Clean up event listeners when component unmounts or socket changes
    return () => {
      console.log("Removing socket listeners");
      socket.off('sync', handleSync);
      socket.off('roll', handleRoll);
      socket.off('newBet', handleNewBet);
      socket.off('betResponse', handleBetResponse);
    };
  }, [socket, updateBalance]);

  const placeBet = (data) => {
    if (!socket) {
      console.error("Cannot place bet: socket not initialized");
      setNotification({
        message: 'Socket not initialized. Please refresh the page.',
        type: 'error',
        duration: 4000 // Standard duration for error notifications
      });
      return;
    }
    
    if (!connected) {
      console.error("Cannot place bet: socket not connected");
      setNotification({
        message: 'Socket not connected. Please wait or refresh the page.',
        type: 'error',
        duration: 4000 // Standard duration for error notifications
      });
      return;
    }
    
    if (!user) {
      console.error("Cannot place bet: user not logged in");
      setNotification({
        message: 'You must be logged in to place bets.',
        type: 'error',
        duration: 4000 // Standard duration for error notifications
      });
      return;
    }
    
    console.log("Placing bet:", {
      id: user.id,
      amount: data.amount,
      color: data.color,
      userBalance: user.balance
    });
    
    socket.emit('placeBet', {
      id: user.id,
      amount: data.amount,
      color: data.color,
    });
  };

  console.log("Rendering roulette component with state:", state);
  console.log("Current user:", user);
  console.log("Socket connected:", connected);

  return (
    <Container>
      <ConnectionStatus connected={connected}>
        {connected ? 'Connected' : 'Disconnected'}
      </ConnectionStatus>
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          duration={notification.duration} 
          onClose={() => setNotification(null)}
        />
      )}
      
      <RouletteGame 
        countdown={state.countdown} 
        roll={state.active} 
        winningColor={state.winningColor} 
        marginLeft={state.marginLeft}
      />
      <RouletteBetting 
        placeBet={placeBet} 
        bets={state.bets} 
        winningColor={state.winningColor} 
        active={state.active}
        connected={connected}
      />
      
      {connectionError && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff5555',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          Connection Error: {connectionError}. Please refresh the page.
        </div>
      )}
    </Container>
  );
}

export default Roulette;