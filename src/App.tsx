import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import UnifiedBackendService, { User } from './services/UnifiedBackendService';
import SplashScreen from './components/SplashScreen';
import MainLayout from './components/MainLayout';
import OnboardingScreen from './components/OnboardingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Create a custom theme that matches the Flutter app's design
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendService] = useState(() => UnifiedBackendService.getInstance());

  useEffect(() => {
    // Show splash screen for 5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }, 5000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await backendService.initialize();
        
        // Remove auto-login - always require manual login
        // const currentUser = backendService.getCurrentUser();
        // if (currentUser) {
        //   setUser(currentUser);
        // }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize backend after splash screen
    if (!showSplash) {
      initializeApp();
    }
  }, [showSplash, backendService]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding_completed', 'true');
    // After onboarding, user will see login screen
  };

  // Show splash screen for 5 seconds
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show loading while initializing backend
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Initializing...
        </Typography>
      </Box>
    );
  }

  // Show onboarding if not completed
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // If no user is logged in, show login screen
  if (!user) {
    return <LoginScreen />;
  }

  // If user is logged in, show main app
  return (
    <Router>
      <Routes>
        <Route 
          path="/*" 
          element={<MainLayout user={user} />}
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
