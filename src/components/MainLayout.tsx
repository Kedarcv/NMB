import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Home as HomeIcon,
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  EmojiEvents as GamificationIcon,
} from '@mui/icons-material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import MapScreen from './MapScreen';
import InsightsScreen from './InsightsScreen';
import ProfileScreen from './ProfileScreen';
import GamificationScreen from './GamificationScreen';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import { User } from '../services/UnifiedBackendService';
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  user: User;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // Define navigation items
  const navigationItems = [
    { label: 'Dashboard', icon: <HomeIcon />, path: '/', component: <UserDashboard user={user} /> },
    { label: 'Map', icon: <MapIcon />, path: '/map', component: <MapScreen user={user} /> },
    { label: 'Gamification', icon: <GamificationIcon />, path: '/gamification', component: <GamificationScreen user={user} /> },
    { label: 'Insights', icon: <AnalyticsIcon />, path: '/insights', component: <InsightsScreen user={user} /> },
    { label: 'Profile', icon: <PersonIcon />, path: '/profile', component: <ProfileScreen user={user} onLogout={signOut} /> },
  ];

  // Add admin route if user is admin
  if (user.role === 'ADMIN') {
    navigationItems.push({ label: 'Admin', icon: <AdminIcon />, path: '/admin', component: <AdminDashboard user={user} /> });
  }

  // Find current navigation index based on path
  const currentIndex = navigationItems.findIndex(item => item.path === location.pathname) || 0;

  const handleNavigationChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    navigate(navigationItems[newValue].path);
  };

  // Set initial value based on current path
  React.useEffect(() => {
    setValue(currentIndex);
  }, [currentIndex]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          {navigationItems.map((item, index) => (
            <Route
              key={item.path}
              path={item.path}
              element={item.component}
            />
          ))}
          {/* Redirect root to dashboard */}
          <Route path="*" element={<UserDashboard user={user} />} />
        </Routes>
      </Box>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: 1,
          borderColor: 'divider',
        }}
        elevation={8}
      >
        <BottomNavigation
          value={value}
          onChange={handleNavigationChange}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 4px',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
            },
          }}
        >
          {navigationItems.map((item, index) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MainLayout;
