import React, { useState, useEffect, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Snackbar,
  Alert,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Fab,
  Tooltip,
  Badge,
  IconButton,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Map as MapIcon,
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  Quiz as QuizIcon,
  Star as StarIcon
} from '@mui/icons-material';
import UnifiedBackendService, { Transaction } from '../services/UnifiedBackendService';
import EnhancedQuiz from './EnhancedQuiz';
import InteractiveMap from './InteractiveMap';
import PaymentManagement from './PaymentManagement';
import QRCodeManagement from './QRCodeManagement';

interface UserDashboardProps {
  user: any;
}

interface DashboardStats {
  totalPoints: number;
  totalEarned: number;
  totalSpent: number;
  currentLevel: string;
  nextLevelPoints: number;
  pointsToNextLevel: number;
  totalQuizzes: number;
  quizzesCompleted: number;
  totalCheckins: number;
  activePromotions: number;
}

interface RecentActivity {
  id: string;
  type: 'POINTS_EARNED' | 'POINTS_REDEEMED';
  title: string;
  description: string;
  points: number;
  timestamp: string;
  icon: React.ReactNode;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as any });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const backendService = UnifiedBackendService.getInstance();
      const userId = user.id;

      const [loyaltyPoints, transactions] = await Promise.all([
        backendService.getLoyaltyPoints(userId),
        backendService.getUserTransactions(userId),
      ]);

      if (loyaltyPoints) {
        const mockStats: DashboardStats = {
          totalPoints: loyaltyPoints.pointsBalance,
          totalEarned: loyaltyPoints.totalEarned,
          totalSpent: loyaltyPoints.totalRedeemed,
          currentLevel: 'Silver',
          nextLevelPoints: 2000,
          pointsToNextLevel: 2000 - loyaltyPoints.pointsBalance,
          totalQuizzes: 15,
          quizzesCompleted: 12,
          totalCheckins: 8,
          activePromotions: 3
        };
        setStats(mockStats);
      }

      const activityFromTransactions: RecentActivity[] = transactions.map((t: Transaction): RecentActivity => {
        const isEarn = t.type === 'EARN';
        return {
          id: t.id,
          type: isEarn ? 'POINTS_EARNED' : 'POINTS_REDEEMED',
          title: isEarn ? 'Points Earned' : 'Points Redeemed',
          description: t.reason,
          points: t.points,
          timestamp: t.timestamp,
          icon: isEarn ? <StarIcon color="success" /> : <TrophyIcon color="warning" />,
        };
      });

      setRecentActivity(activityFromTransactions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Removed duplicate loadDashboardData function

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze':
        return '#cd7f32';
      case 'silver':
        return '#c0c0c0';
      case 'gold':
        return '#ffd700';
      case 'platinum':
        return '#e5e4e2';
      default:
        return '#cd7f32';
    }
  };

  const getProgressPercentage = () => {
    if (!stats) return 0;
    const totalRange = stats.nextLevelPoints - (stats.nextLevelPoints - stats.pointsToNextLevel);
    const currentProgress = stats.totalPoints - (stats.nextLevelPoints - stats.pointsToNextLevel);
    return Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Welcome back, {user.firstName || user.name || 'User'}! 👋
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={loadDashboardData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
          {/* Points Card */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Points
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.totalPoints.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress to {stats.currentLevel} Level
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getProgressPercentage().toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProgressPercentage()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stats.pointsToNextLevel} points to next level
              </Typography>
            </CardContent>
          </Card>

          {/* Level Card */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: getLevelColor(stats.currentLevel) }}>
                  <TrophyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Current Level
                  </Typography>
                  <Typography variant="h4" sx={{ color: getLevelColor(stats.currentLevel) }}>
                    {stats.currentLevel}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Earned
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    +{stats.totalEarned.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    -{stats.totalSpent.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <TimelineIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Activity Summary
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    {stats.quizzesCompleted}/{stats.totalQuizzes}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Check-ins
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {stats.totalCheckins}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Promotions
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {stats.activePromotions}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" icon={<DashboardIcon />} />
          <Tab label="Quizzes" icon={<QuizIcon />} />
          <Tab label="Interactive Map" icon={<MapIcon />} />
          <Tab label="Payments" icon={<PaymentIcon />} />
          <Tab label="QR Codes" icon={<QrCodeIcon />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Recent Activity */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <InfoIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography color="text.secondary">
                    No recent activity
                  </Typography>
                </Box>
              ) : (
                <List>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemIcon>
                          {activity.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {activity.title}
                              </Typography>
                              {activity.points > 0 && (
                                <Chip
                                  label={`+${activity.points} points`}
                                  color="success"
                                  size="small"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(activity.timestamp)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<QuizIcon />}
                  onClick={() => setActiveTab(1)}
                >
                  Take a Quiz
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => setActiveTab(2)}
                >
                  Find Partners
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeIcon />}
                  onClick={() => setActiveTab(4)}
                >
                  Scan QR Code
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PaymentIcon />}
                  onClick={() => setActiveTab(3)}
                >
                  Manage Payments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 1 && (
        <EnhancedQuiz quizId="gq1" />
      )}

      {activeTab === 2 && (
        <InteractiveMap />
      )}

      {activeTab === 3 && (
        <PaymentManagement user={user} />
      )}

      {activeTab === 4 && (
        <QRCodeManagement user={user} />
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => {
          // Quick action - could open a menu or specific feature
          showNotification('Quick action triggered!', 'info');
        }}
      >
        <AddIcon />
      </Fab>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDashboard;
