import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("Checking for stored user:", storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Found stored user:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.log("No stored user found");
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = (userData) => {
    console.log("Setting user in AuthContext:", userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    console.log("Logging out user");
    setUser(null);
    localStorage.removeItem('user');
  };

  // Update user balance
  const updateBalance = (newBalance) => {
    if (user) {
      console.log(`Updating user balance from ${user.balance} to ${newBalance}`);
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      console.error("Cannot update balance: No user logged in");
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    updateBalance,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 