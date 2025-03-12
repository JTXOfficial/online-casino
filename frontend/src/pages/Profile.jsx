import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faUser, faSave, faTimes, faLock, faEye, faEyeSlash, faCamera, faSpinner } from '@fortawesome/free-solid-svg-icons';

const ProfileContainer = styled.div`
  min-height: calc(100vh - 60px);
  background-color: #172327;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
`;

const ProfileCard = styled.div`
  background-color: #1a1e23;
  border-radius: 8px;
  padding: 30px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #2c3136;
  padding-bottom: 20px;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #2c3136;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 2rem;
  color: #00c74d;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfilePictureOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  color: white;
  margin: 0 0 5px 0;
`;

const Balance = styled.div`
  display: flex;
  align-items: center;
  color: white;
  font-size: 1.2rem;
  
  svg {
    color: gold;
    margin-right: 8px;
  }
`;

const ProfileSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  color: #00c74d;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: white;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background-color: #2c3136;
  border: 1px solid #3a3f45;
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #00c74d;
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  
  &:hover {
    color: white;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #2c3136;
  margin: 20px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(Button)`
  background-color: #00c74d;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #00b344;
  }
`;

const CancelButton = styled(Button)`
  background-color: #3a3f45;
  color: white;
  
  &:hover {
    background-color: #4a4f55;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const StatCard = styled.div`
  background-color: #2c3136;
  border-radius: 6px;
  padding: 15px;
  color: white;
`;

const StatTitle = styled.div`
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  color: #ff5555;
  margin-top: 10px;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #00c74d;
  margin-top: 10px;
  font-size: 0.9rem;
`;

const ProfilePage = () => {
  const { user, isAuthenticated, updateUser, updatePassword, uploadProfilePicture } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Debug: Log user object
  console.log("User object in Profile:", user);
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Debug: Log editing state when it changes
  useEffect(() => {
    console.log("Editing state changed to:", editing);
  }, [editing]);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    try {
      setUploadingPicture(true);
      setError(null);
      
      await uploadProfilePicture(file);
      
      setSuccess('Profile picture updated successfully');
    } catch (error) {
      setError(error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };
  
  const validateForm = () => {
    // Check if current password is provided
    if (!formData.currentPassword) {
      setError('Current password is required to make changes');
      return false;
    }
    
    // If changing password, validate new password fields
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return false;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New password and confirmation do not match');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      // First, verify the current password
      const passwordVerified = await updateUser({
        currentPassword: formData.currentPassword,
        verifyOnly: true
      });
      
      if (!passwordVerified) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }
      
      // Update profile information if username or email changed
      if (formData.username !== user.username || formData.email !== user.email) {
        await updateUser({
          username: formData.username,
          email: formData.email,
          currentPassword: formData.currentPassword
        });
      }
      
      // Update password if new password is provided
      if (formData.newPassword) {
        await updatePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
      }
      
      setSuccess('Profile updated successfully');
      setEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setEditing(false);
    setError(null);
    setSuccess(null);
  };
  
  // TODO: Add statistics from the backend
  const stats = {
    totalBets: 42,
    winRate: '38%',
    biggestWin: 250.00,
    favoriteGame: 'Roulette'
  };
  
  return (
    <ProfileContainer>
      <ProfileCard>        
        <ProfileHeader>
          <ProfileAvatar>
            {user?.profilePicture ? (
              <img src={`http://localhost:4000${user.profilePicture}`} alt="Profile" />
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )}
            <ProfilePictureOverlay onClick={handleProfilePictureClick}>
              <FontAwesomeIcon icon={faCamera} />
            </ProfilePictureOverlay>
            {uploadingPicture && (
              <LoadingOverlay>
                <FontAwesomeIcon icon={faSpinner} />
              </LoadingOverlay>
            )}
            <FileInput 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*"
            />
          </ProfileAvatar>
          <ProfileInfo>
            <Username>{user?.username}</Username>
            <Balance>
              <FontAwesomeIcon icon={faCoins} />
              {user?.balance.toFixed(2)}
            </Balance>
          </ProfileInfo>
        </ProfileHeader>
        
        <ProfileSection>
          <SectionTitle>Account Information</SectionTitle>
          <form onSubmit={handleSubmit} key={editing ? 'editing' : 'viewing'}>
            <FormGroup>
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!editing || loading}
                style={{ 
                  backgroundColor: !editing ? '#2c3136' : '#3a3f45',
                  cursor: !editing ? 'not-allowed' : 'text'
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing || loading}
                style={{ 
                  backgroundColor: !editing ? '#2c3136' : '#3a3f45',
                  cursor: !editing ? 'not-allowed' : 'text'
                }}
              />
            </FormGroup>
            
            {editing && (
              <>
                <Divider />
                <FormGroup>
                  <Label htmlFor="currentPassword">
                    <FontAwesomeIcon icon={faLock} style={{ marginRight: '8px' }} />
                    Current Password (required for any changes)
                  </Label>
                  <PasswordInputWrapper>
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <PasswordToggleButton 
                      type="button" 
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                    </PasswordToggleButton>
                  </PasswordInputWrapper>
                </FormGroup>
                
                <Divider />
                <SectionTitle>Change Password (Optional)</SectionTitle>
                
                <FormGroup>
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordInputWrapper>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <PasswordToggleButton 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                    </PasswordToggleButton>
                  </PasswordInputWrapper>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <PasswordInputWrapper>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <PasswordToggleButton 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </PasswordToggleButton>
                  </PasswordInputWrapper>
                </FormGroup>
              </>
            )}
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            {editing ? (
              <ButtonGroup>
                <SaveButton type="submit" disabled={loading}>
                  <FontAwesomeIcon icon={faSave} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </SaveButton>
                <CancelButton type="button" onClick={handleCancel} disabled={loading}>
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </CancelButton>
              </ButtonGroup>
            ) : (
              <ButtonGroup>
                <SaveButton 
                  type="button" 
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </SaveButton>
              </ButtonGroup>
            )}
          </form>
        </ProfileSection>
        
        <ProfileSection>
          <SectionTitle>Statistics</SectionTitle>
          <StatsContainer>
            <StatCard>
              <StatTitle>Total Bets</StatTitle>
              <StatValue>{stats.totalBets}</StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Win Rate</StatTitle>
              <StatValue>{stats.winRate}</StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Biggest Win</StatTitle>
              <StatValue>{stats.biggestWin.toFixed(2)}</StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Favorite Game</StatTitle>
              <StatValue>{stats.favoriteGame}</StatValue>
            </StatCard>
          </StatsContainer>
        </ProfileSection>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default ProfilePage; 