import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Avatar,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Loyalty as LoyaltyIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import UnifiedBackendService, { User, LoyaltyPoints, Transaction } from '../services/UnifiedBackendService';
import xplugLogo from '../xplug_logo.png';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints | undefined>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [backendService] = useState(() => UnifiedBackendService.getInstance());

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const points = await backendService.getLoyaltyPoints(user.id);
        const userTransactions = await backendService.getUserTransactions(user.id);
        
        setLoyaltyPoints(points);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user.id, backendService]);

  const handleLogout = () => {
    backendService.logout();
    onLogout();
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)' }}>
        <Toolbar>
          <LoyaltyIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LoyaltyIQ Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>
              <PersonIcon />
            </Avatar>
            <Typography variant="body2">
              {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {/* Welcome Card */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                border: '1px solid #90CAF9',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976D2', mb: 1 }}>
                Welcome back, {user.firstName}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Role: {user.role} • Member since {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Paper>
          </Box>

          {/* Loyalty Points Card */}
          <Box>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <LoyaltyIcon sx={{ fontSize: 60, color: '#1976D2', mb: 2 }} />
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#1976D2', mb: 1 }}>
                  {loyaltyPoints?.pointsBalance || 0}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  Loyalty Points
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {loyaltyPoints?.totalEarned || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Earned
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="error.main">
                      {loyaltyPoints?.totalRedeemed || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Redeemed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Quick Actions Card */}
          <Box>
            <Card elevation={3}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<TrendingUpIcon />}
                      sx={{
                        py: 2,
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #45A049 0%, #3D8B40 100%)',
                        },
                      }}
                    >
                      Earn Points
                    </Button>
                  </Box>
                  <Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LoyaltyIcon />}
                      sx={{
                        py: 2,
                        borderColor: '#FF9800',
                        color: '#FF9800',
                        '&:hover': {
                          borderColor: '#F57C00',
                          backgroundColor: 'rgba(255, 152, 0, 0.04)',
                        },
                      }}
                    >
                      Redeem
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Transactions */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Card elevation={3}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <HistoryIcon sx={{ mr: 2, color: '#1976D2' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Recent Transactions
                  </Typography>
                </Box>
                
                {transactions.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center', background: '#F5F5F5' }}>
                    <Typography variant="body1" color="text.secondary">
                      No transactions yet. Start earning points to see your activity here!
                    </Typography>
                  </Paper>
                ) : (
                  <List>
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <React.Fragment key={transaction.id}>
                        <ListItem>
                          <ListItemIcon>
                            <Avatar
                              sx={{
                                bgcolor: transaction.type === 'EARN' ? 'success.main' : 'warning.main',
                                width: 40,
                                height: 40,
                              }}
                            >
                              {transaction.type === 'EARN' ? '+' : '-'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={transaction.reason}
                            secondary={new Date(transaction.timestamp).toLocaleDateString()}
                          />
                          <Typography
                            variant="h6"
                            color={transaction.type === 'EARN' ? 'success.main' : 'warning.main'}
                            sx={{ fontWeight: 'bold' }}
                          >
                            {transaction.type === 'EARN' ? '+' : '-'}{transaction.points} pts
                          </Typography>
                        </ListItem>
                        {index < transactions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* Footer with XPLU Logo */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              Powered by:
            </Typography>
            <Box
              component="img"
              src={xplugLogo}
              alt="XPLU Logo"
              sx={{
                height: 40,
                width: 'auto',
                filter: 'grayscale(100%)',
                opacity: 0.7,
                '&:hover': {
                  filter: 'grayscale(0%)',
                  opacity: 1,
                  transition: 'all 0.3s ease',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" align="center">
              LoyaltyIQ - AI-Powered Loyalty Platform
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
