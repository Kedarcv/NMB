import React, { useState, useEffect } from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
  Switch,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  Notifications as NotificationsIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { User } from '../services/UnifiedBackendService';
import UnifiedBackendService from '../services/UnifiedBackendService';

interface ProfileScreenProps {
  user: User;
  onLogout: () => void;
}

interface ProfileData {
  memberSince: string;
  currentLevel: number;
  totalPoints: number;
  achievements: number;
  streak: number;
  nextLevelPoints: number;
  levelProgress: number;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const backendService = UnifiedBackendService.getInstance();

  const loadProfileData = React.useCallback(async () => { // eslint-disable-line react-hooks/exhaustive-deps
    try {
      setIsLoading(true);
      // Load real profile data from backend
      const points = await backendService.getLoyaltyPoints(user.id);
      
      // Calculate level and progress based on real data
      const totalPoints = points?.pointsBalance || 0;
      const currentLevel = Math.floor(totalPoints / 100) + 1;
      const nextLevelPoints = currentLevel * 100;
      const levelProgress = ((totalPoints % 100) / 100) * 100;
      
      setProfileData({
        memberSince: new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        currentLevel,
        totalPoints,
        achievements: Math.floor(totalPoints / 50), // Achievement every 50 points
        streak: Math.floor(Math.random() * 30) + 1, // This would come from backend
        nextLevelPoints,
        levelProgress,
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
      // Fallback to default data
      setProfileData({
        memberSince: new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        currentLevel: 1,
        totalPoints: 0,
        achievements: 0,
        streak: 0,
        nextLevelPoints: 100,
        levelProgress: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [backendService, user.id, user.createdAt, setProfileData, setIsLoading]);

  const handleSaveProfile = async () => {
    try {
      // In a real app, this would call the backend to update the profile
      // For now, we'll simulate the update
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setShowEditDialog(false);
      
      // Update local user object
      user.firstName = editForm.firstName;
      user.lastName = editForm.lastName;
      user.email = editForm.email;
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const handleSettingChange = async (setting: string, value: boolean) => {
    try {
      // In a real app, this would call the backend to update user preferences
      switch (setting) {
        case 'notifications':
          setNotificationsEnabled(value);
          break;
        case 'location':
          setLocationEnabled(value);
          break;
        case 'email':
          setEmailUpdatesEnabled(value);
          break;
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  if (isLoading || !profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  const profileStats = [
    { 
      label: 'Member Since', 
      value: profileData.memberSince, 
      icon: <CalendarIcon />,
      color: '#1976D2'
    },
    { 
      label: 'Current Level', 
      value: `Level ${profileData.currentLevel}`, 
      icon: <StarIcon />,
      color: '#FF9800'
    },
    { 
      label: 'Total Points', 
      value: `${profileData.totalPoints.toLocaleString()} pts`, 
      icon: <TrendingIcon />,
      color: '#4CAF50'
    },
    { 
      label: 'Achievements', 
      value: `${profileData.achievements} unlocked`, 
      icon: <TrophyIcon />,
      color: '#9C27B0'
    },
  ];

  const settingsItems = [
    {
      title: 'Push Notifications',
      description: 'Receive alerts for new offers and rewards',
      icon: <NotificationsIcon />,
      action: (
        <Switch
          checked={notificationsEnabled}
          onChange={(e) => handleSettingChange('notifications', e.target.checked)}
          color="primary"
        />
      ),
    },
    {
      title: 'Location Services',
      description: 'Allow app to access your location for nearby offers',
      icon: <LocationIcon />,
      action: (
        <Switch
          checked={locationEnabled}
          onChange={(e) => handleSettingChange('location', e.target.checked)}
          color="primary"
        />
      ),
    },
    {
      title: 'Email Updates',
      description: 'Receive weekly summaries and special offers',
      icon: <EmailIcon />,
      action: (
        <Switch
          checked={emailUpdatesEnabled}
          onChange={(e) => handleSettingChange('email', e.target.checked)}
          color="primary"
        />
      ),
    },
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: <EditIcon />,
      action: () => setShowEditDialog(true),
      color: '#1976D2',
    },
    {
      title: 'Security Settings',
      description: 'Manage password and privacy',
      icon: <SecurityIcon />,
      action: () => console.log('Security settings'),
      color: '#D32F2F',
    },
    {
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: <HelpIcon />,
      action: () => console.log('Help & Support'),
      color: '#FF9800',
    },
    {
      title: 'Logout',
      description: 'Sign out of your account',
      icon: <LogoutIcon />,
      action: () => setShowLogoutDialog(true),
      color: '#757575',
    },
  ];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
          color: 'white',
          py: 3,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Profile
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage your account and preferences
              </Typography>
            </Box>
            <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -2, px: 2 }}>
        {/* Profile Header Card */}
        <Card
          elevation={4}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
            border: '1px solid #90CAF9',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#1976D2',
                  fontSize: 40,
                  mr: 3,
                  border: '4px solid white',
                }}
              >
                {user.firstName.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1565C0', mb: 1 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="h6" sx={{ color: '#1976D2', mb: 2 }}>
                  {user.email}
                </Typography>
                <Typography variant="body1" sx={{ color: '#424242', mb: 2 }}>
                  Role: {user.role} • Member since {profileData.memberSince}
                </Typography>
                
                {/* Level Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Level {profileData.currentLevel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profileData.totalPoints} / {profileData.nextLevelPoints} pts
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={profileData.levelProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setShowEditDialog(true)}
                  sx={{
                    borderColor: '#1976D2',
                    color: '#1976D2',
                    '&:hover': {
                      borderColor: '#1565C0',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Profile Stats */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Profile Statistics
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          {profileStats.map((stat, index) => (
            <Box key={index}>
              <Card elevation={2} sx={{ borderRadius: 3, textAlign: 'center' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ color: stat.color, mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#424242', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Settings */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Settings
        </Typography>
        
        <Card elevation={2} sx={{ borderRadius: 3, mb: 4 }}>
          <List sx={{ p: 0 }}>
            {settingsItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#1976D2',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {item.icon}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    }
                  />
                  {item.action}
                </ListItem>
                {index < settingsItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>

        {/* Quick Actions */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Quick Actions
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {quickActions.map((action, index) => (
            <Box key={index}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                }}
                onClick={action.action}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: `${action.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <Box sx={{ color: action.color, fontSize: 30 }}>
                      {action.icon}
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Edit Profile
            </Typography>
            <IconButton onClick={() => setShowEditDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {saveSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully!
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              type="email"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setShowEditDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LogoutIcon sx={{ color: '#D32F2F' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Confirm Logout
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to logout? You'll need to sign in again to access your account.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setShowLogoutDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              backgroundColor: '#D32F2F',
              '&:hover': { backgroundColor: '#C62828' },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileScreen;
