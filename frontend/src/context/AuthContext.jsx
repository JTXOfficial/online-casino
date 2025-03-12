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

  // Update user profile
  const updateUser = async (userData) => {
    if (user) {
      console.log(`Updating user profile for ${user.username} with ID:`, user.id || user._id);
      
      try {
        // If verifyOnly flag is set, only verify the password without updating the profile
        if (userData.verifyOnly) {
          const response = await fetch(`http://localhost:4000/api/auth/verify-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id || user._id,
              password: userData.currentPassword
            }),
          });
          
          if (!response.ok) {
            return false;
          }
          
          return true;
        }
        
        // Make API call to update user profile
        const userId = user.id || user._id;
        const url = `http://localhost:4000/api/auth/users/${userId}`;
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            currentPassword: userData.currentPassword
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        }
        
        const updatedUserData = await response.json();
        
        // Update local state with the response from the server
        const updatedUser = { 
          ...user, 
          ...updatedUserData,
          // Ensure we preserve the ID in the format the app expects
          id: updatedUserData.id || updatedUserData._id || user.id || user._id
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }
    } else {
      console.error("Cannot update user: No user logged in");
      throw new Error("No user logged in");
    }
  };

  // Update user password
  const updatePassword = async (passwordData) => {
    if (user) {
      try {
        const userId = user.id || user._id;
        const url = `http://localhost:4000/api/auth/users/${userId}/password`;
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update password');
        }
        
        return true;
      } catch (error) {
        console.error("Error updating password:", error);
        throw error;
      }
    } else {
      console.error("Cannot update password: No user logged in");
      throw new Error("No user logged in");
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    if (user) {
      try {
        const userId = user.id || user._id;
        const url = `http://localhost:4000/api/auth/users/${userId}/profile-picture`;
        
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload profile picture');
        }
        
        const data = await response.json();
        
        // Update user with new profile picture URL
        const updatedUser = { 
          ...user, 
          profilePicture: data.profilePicture 
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return data.profilePicture;
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw error;
      }
    } else {
      console.error("Cannot upload profile picture: No user logged in");
      throw new Error("No user logged in");
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    updateBalance,
    updateUser,
    updatePassword,
    uploadProfilePicture,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 