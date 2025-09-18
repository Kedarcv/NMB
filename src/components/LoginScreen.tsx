import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Loyalty as LoyaltyIcon,
} from '@mui/icons-material';
import UnifiedBackendService from '../services/UnifiedBackendService';
import { useAuth } from '../contexts/AuthContext';
import xplugLogo from '../xplug_logo.png';

const LoginScreen: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setIsErrorMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [backendService] = useState(() => UnifiedBackendService.getInstance());

  useEffect(() => {
    const initializeService = async () => {
      try {
        await backendService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize service:', error);
        setIsErrorMessage('Failed to initialize application');
      }
    };

    initializeService();
  }, [backendService]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setIsErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setIsErrorMessage('');

    try {
      const result = await signIn(email.trim(), password);
      
      if (result.success) {
        // Login successful - auth context will handle the user state
        console.log('Login successful:', result.message);
      } else {
        setIsErrorMessage(result.message);
      }
    } catch (error) {
      setIsErrorMessage('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      {/* Main Content */}
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <CardContent sx={{ padding: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <LoyaltyIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#1976D2', mb: 1 }}>
                LoyaltyIQ
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-Powered Loyalty Platform
              </Typography>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                required
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                required
              />

              {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errorMessage}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Footer with XPLU Logo */}
      <Box
        sx={{
          py: 2,
          textAlign: 'center',
          mt: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
            Powered by:
          </Typography>
          <Box
            component="img"
            src={xplugLogo}
            alt="XPLU Logo"
            sx={{
              height: 30,
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
                transition: 'opacity 0.3s ease',
              },
            }}
          />
          <Typography variant="caption" color="white" sx={{ opacity: 0.6 }}>
            LoyaltyIQ - AI-Powered Loyalty Platform
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginScreen;
