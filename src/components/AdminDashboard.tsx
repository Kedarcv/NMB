import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  CircularProgress,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Zoom,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  LocalOffer as OfferIcon,
  Quiz as QuizIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
// TODO: Replace with a compatible chart library (e.g., recharts, chart.js)
import UnifiedBackendService, { User } from '../services/UnifiedBackendService';

interface AdminDashboardProps {
  user: User;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`admin-tabpanel-${index}`}
    aria-labelledby={`admin-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// Form interfaces
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
}

interface PartnerFormData {
  name: string;
  type: string;
  location: string;
  description: string;
  isActive: boolean;
}

interface QuizFormData {
  title: string;
  category: string;
  difficultyLevel: string;
  pointsReward: number;
  isActive: boolean;
}

interface PromotionFormData {
  title: string;
  promotionType: 'DISCOUNT' | 'POINTS_MULTIPLIER' | 'BONUS_POINTS';
  discountPercentage?: number;
  pointsMultiplier?: number;
  bonusPoints?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as any });
  const [overviewData, setOverviewData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  // Form states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form data states
  const [userFormData, setUserFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER',
    isActive: true
  });

  const [partnerFormData, setPartnerFormData] = useState<PartnerFormData>({
    name: '',
    type: '',
    location: '',
    description: '',
    isActive: true
  });

  const [quizFormData, setQuizFormData] = useState<QuizFormData>({
    title: '',
    category: '',
    difficultyLevel: '',
    pointsReward: 0,
    isActive: true
  });

  const [promotionFormData, setPromotionFormData] = useState<PromotionFormData>({
    title: '',
    promotionType: 'DISCOUNT',
    discountPercentage: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });

  const backendService = UnifiedBackendService.getInstance();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Load overview data
      const overview = await backendService.getAdminOverview();
      setOverviewData(overview);
      // Load other data
      const [usersData, partnersData, quizzesData, promotionsData] = await Promise.all([
        backendService.getAdminUsers(),
        backendService.getAdminPartners(),
        backendService.getAdminQuizzes(),
        backendService.getAdminPromotions()
      ]);
      setUsers(usersData || []);
      setPartners(partnersData || []);
      setQuizzes(quizzesData || []);
      setPromotions(promotionsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [backendService]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // User management functions
  const handleAddUser = () => {
    setEditingItem(null);
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'USER',
      isActive: true
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingItem(user);
    setUserFormData({
      firstName: user.firstName || user.fullName?.split(' ')[0] || '',
      lastName: user.lastName || user.fullName?.split(' ')[1] || '',
      email: user.email,
      role: user.role || 'USER',
      isActive: user.isActive
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingItem) {
        // Update existing user
        await backendService.updateUser(editingItem.id, userFormData);
        showNotification('User updated successfully!');
      } else {
        // Create new user
        await backendService.createUser(userFormData);
        showNotification('User created successfully!');
      }
      setUserDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      showNotification('Failed to save user', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await backendService.deleteUser(userId);
        showNotification('User deleted successfully!');
        loadDashboardData();
      } catch (error) {
        showNotification('Failed to delete user', 'error');
      }
    }
  };

  // Partner management functions
  const handleAddPartner = () => {
    setEditingItem(null);
    setPartnerFormData({
      name: '',
      type: '',
      location: '',
      description: '',
      isActive: true
    });
    setPartnerDialogOpen(true);
  };

  const handleEditPartner = (partner: any) => {
    setEditingItem(partner);
    setPartnerFormData({
      name: partner.name,
      type: partner.type,
      location: partner.location,
      description: partner.description || '',
      isActive: partner.isActive
    });
    setPartnerDialogOpen(true);
  };

  const handleSavePartner = async () => {
    try {
      if (editingItem) {
        await backendService.updatePartner(editingItem.id, partnerFormData);
        showNotification('Partner updated successfully!');
      } else {
        await backendService.createPartner(partnerFormData);
        showNotification('Partner created successfully!');
      }
      setPartnerDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      showNotification('Failed to save partner', 'error');
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await backendService.deletePartner(partnerId);
        showNotification('Partner deleted successfully!');
        loadDashboardData();
      } catch (error) {
        showNotification('Failed to delete partner', 'error');
      }
    }
  };

  // Quiz management functions
  const handleAddQuiz = () => {
    setEditingItem(null);
    setQuizFormData({
      title: '',
      category: '',
      difficultyLevel: '',
      pointsReward: 0,
      isActive: true
    });
    setQuizDialogOpen(true);
  };

  const handleEditQuiz = (quiz: any) => {
    setEditingItem(quiz);
    setQuizFormData({
      title: quiz.title,
      category: quiz.category,
      difficultyLevel: quiz.difficultyLevel,
      pointsReward: quiz.pointsReward,
      isActive: quiz.isActive
    });
    setQuizDialogOpen(true);
  };

  const handleSaveQuiz = async () => {
    try {
      if (editingItem) {
        await backendService.updateQuiz(editingItem.id, quizFormData);
        showNotification('Quiz updated successfully!');
      } else {
        await backendService.createQuiz(quizFormData);
        showNotification('Quiz created successfully!');
      }
      setQuizDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      showNotification('Failed to save quiz', 'error');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await backendService.deleteQuiz(quizId);
        showNotification('Quiz deleted successfully!');
        loadDashboardData();
      } catch (error) {
        showNotification('Failed to delete quiz', 'error');
      }
    }
  };

  // Promotion management functions
  const handleAddPromotion = () => {
    setEditingItem(null);
    setPromotionFormData({
      title: '',
      promotionType: 'DISCOUNT',
      discountPercentage: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    });
    setPromotionDialogOpen(true);
  };

  const handleEditPromotion = (promotion: any) => {
    setEditingItem(promotion);
    setPromotionFormData({
      title: promotion.title,
      promotionType: promotion.promotionType,
      discountPercentage: promotion.discountPercentage,
      pointsMultiplier: promotion.pointsMultiplier,
      bonusPoints: promotion.bonusPoints,
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0],
      isActive: promotion.isActive
    });
    setPromotionDialogOpen(true);
  };

  const handleSavePromotion = async () => {
    try {
      if (editingItem) {
        await backendService.updatePromotion(editingItem.id, promotionFormData);
        showNotification('Promotion updated successfully!');
      } else {
        await backendService.createPromotion(promotionFormData);
        showNotification('Promotion created successfully!');
      }
      setPromotionDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      showNotification('Failed to save promotion', 'error');
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await backendService.deletePromotion(promotionId);
        showNotification('Promotion deleted successfully!');
        loadDashboardData();
      } catch (error) {
        showNotification('Failed to delete promotion', 'error');
      }
    }
  };

  const handleRegenerateQuiz = async (quizId: string) => {
    try {
      await backendService.regenerateQuizQuestions(quizId);
      showNotification('Quiz questions regenerated successfully!');
      loadDashboardData();
    } catch (error) {
      showNotification('Failed to regenerate quiz questions', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ py: 3 }}>
      {/* Header */}
      <Grid item xs={12}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user.firstName}! Manage your loyalty platform from here.
          </Typography>
        </Box>
      </Grid>

      {/* Tabs */}
      <Grid item xs={12}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
            <Tab icon={<DashboardIcon />} label="Overview" />
            <Tab icon={<PeopleIcon />} label="Users" />
            <Tab icon={<BusinessIcon />} label="Partners" />
            <Tab icon={<QuizIcon />} label="Quizzes" />
            <Tab icon={<OfferIcon />} label="Promotions" />
            <Tab icon={<AnalyticsIcon />} label="Analytics" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>
      </Grid>

      {/* Tab Panels */}
      <Grid item xs={12}>
        <TabPanel value={tabValue} index={0}>
          {/* Overview Tab - Fixed Layout */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {overviewData?.totalUsers || 0}
                  </Typography>
                  <LinearProgress variant="determinate" value={70} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Partners
                  </Typography>
                  <Typography variant="h4">
                    {overviewData?.activePartners || 0}
                  </Typography>
                  <LinearProgress variant="determinate" value={85} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Quizzes
                  </Typography>
                  <Typography variant="h4">
                    {overviewData?.totalQuizzes || 0}
                  </Typography>
                  <LinearProgress variant="determinate" value={60} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Promotions
                  </Typography>
                  <Typography variant="h4">
                    {overviewData?.activePromotions || 0}
                  </Typography>
                  <LinearProgress variant="determinate" value={90} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Users Tab */}
          <Card>
            <CardHeader 
              title="User Management" 
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUser}>
                  Add User
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Points</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName || `${user.firstName} ${user.lastName}`}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.isActive ? 'Active' : 'Inactive'} 
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.totalPoints || 0}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditUser(user)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteUser(user.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Partners Tab */}
          <Card>
            <CardHeader 
              title="Partner Management" 
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPartner}>
                  Add Partner
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>{partner.name}</TableCell>
                        <TableCell>{partner.type}</TableCell>
                        <TableCell>{partner.location}</TableCell>
                        <TableCell>
                          <Chip 
                            label={partner.status || (partner.isActive ? 'ACTIVE' : 'INACTIVE')} 
                            color={partner.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditPartner(partner)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeletePartner(partner.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Quizzes Tab */}
          <Card>
            <CardHeader 
              title="Quiz Management" 
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddQuiz}>
                  Add Quiz
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Difficulty</TableCell>
                      <TableCell>Points</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quizzes.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{quiz.category}</TableCell>
                        <TableCell>{quiz.difficultyLevel}</TableCell>
                        <TableCell>{quiz.pointsReward}</TableCell>
                        <TableCell>
                          <Chip 
                            label={quiz.isActive ? 'Active' : 'Inactive'} 
                            color={quiz.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Regenerate Questions with AI">
                            <IconButton 
                              size="small" 
                              onClick={() => handleRegenerateQuiz(quiz.id)}
                              color="primary"
                            >
                              <AutoAwesomeIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton size="small" onClick={() => handleEditQuiz(quiz)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteQuiz(quiz.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {/* Promotions Tab */}
          <Card>
            <CardHeader 
              title="Promotion Management" 
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPromotion}>
                  Add Promotion
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {promotions.map((promotion) => (
                      <TableRow key={promotion.id}>
                        <TableCell>{promotion.title}</TableCell>
                        <TableCell>{promotion.promotionType}</TableCell>
                        <TableCell>
                          {promotion.discountPercentage && `${promotion.discountPercentage}%`}
                          {promotion.pointsMultiplier && `${promotion.pointsMultiplier}x`}
                          {promotion.bonusPoints && `${promotion.bonusPoints} pts`}
                        </TableCell>
                        <TableCell>{new Date(promotion.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={promotion.isActive ? 'Active' : 'Inactive'} 
                            color={promotion.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditPromotion(promotion)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeletePromotion(promotion.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          {/* Analytics Tab - Real Charts */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Card>
                <CardHeader title="User Growth" />
                <CardContent>
                  {/* Replace with compatible chart library */}
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2" color="text.secondary">User Growth Chart Placeholder</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Card>
                <CardHeader title="Points Distribution" />
                <CardContent>
                  {/* Replace with compatible chart library */}
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2" color="text.secondary">Points Distribution Chart Placeholder</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          {/* Settings Tab */}
          <Card>
            <CardHeader title="System Settings" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Loyalty Program Settings
                  </Typography>
                  <Stack spacing={2}>
                    <TextField 
                      label="Points Expiry (days)" 
                      defaultValue="365" 
                      fullWidth 
                    />
                    <TextField 
                      label="Max Daily Points" 
                      defaultValue="1000" 
                      fullWidth 
                    />
                    <TextField 
                      label="Referral Bonus" 
                      defaultValue="200" 
                      fullWidth 
                    />
                    <TextField 
                      label="Check-in Bonus" 
                      defaultValue="10" 
                      fullWidth 
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Quiz Settings
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Auto-regenerate quiz questions"
                    />
                    <TextField 
                      label="Questions per quiz" 
                      defaultValue="5" 
                      fullWidth 
                    />
                    <TextField 
                      label="Time limit (minutes)" 
                      defaultValue="15" 
                      fullWidth 
                    />
                  </Stack>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" startIcon={<SaveIcon />}>
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Grid>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="First Name"
              value={userFormData.firstName}
              onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={userFormData.lastName}
              onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as 'ADMIN' | 'USER' })}
                label="Role"
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={userFormData.isActive}
                  onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} variant="contained" startIcon={<SaveIcon />}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Partner Dialog */}
      <Dialog open={partnerDialogOpen} onClose={() => setPartnerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Partner Name"
              value={partnerFormData.name}
              onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Category/Type"
              value={partnerFormData.type}
              onChange={(e) => setPartnerFormData({ ...partnerFormData, type: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Location"
              value={partnerFormData.location}
              onChange={(e) => setPartnerFormData({ ...partnerFormData, location: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={partnerFormData.description}
              onChange={(e) => setPartnerFormData({ ...partnerFormData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={partnerFormData.isActive}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartnerDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSavePartner} variant="contained" startIcon={<SaveIcon />}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onClose={() => setQuizDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Quiz' : 'Add New Quiz'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Quiz Title"
              value={quizFormData.title}
              onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Category"
              value={quizFormData.category}
              onChange={(e) => setQuizFormData({ ...quizFormData, category: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Difficulty Level"
              value={quizFormData.difficultyLevel}
              onChange={(e) => setQuizFormData({ ...quizFormData, difficultyLevel: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Points Reward"
              type="number"
              value={quizFormData.pointsReward}
              onChange={(e) => setQuizFormData({ ...quizFormData, pointsReward: parseInt(e.target.value) || 0 })}
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={quizFormData.isActive}
                  onChange={(e) => setQuizFormData({ ...quizFormData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuizDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveQuiz} variant="contained" startIcon={<SaveIcon />}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Promotion Dialog */}
      <Dialog open={promotionDialogOpen} onClose={() => setPromotionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Promotion' : 'Add New Promotion'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Promotion Title"
              value={promotionFormData.title}
              onChange={(e) => setPromotionFormData({ ...promotionFormData, title: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Promotion Type</InputLabel>
              <Select
                value={promotionFormData.promotionType}
                onChange={(e) => setPromotionFormData({ ...promotionFormData, promotionType: e.target.value as any })}
                label="Promotion Type"
              >
                <MenuItem value="DISCOUNT">Discount</MenuItem>
                <MenuItem value="POINTS_MULTIPLIER">Points Multiplier</MenuItem>
                <MenuItem value="BONUS_POINTS">Bonus Points</MenuItem>
              </Select>
            </FormControl>
            {promotionFormData.promotionType === 'DISCOUNT' && (
              <TextField
                label="Discount Percentage"
                type="number"
                value={promotionFormData.discountPercentage || ''}
                onChange={(e) => setPromotionFormData({ ...promotionFormData, discountPercentage: parseInt(e.target.value) || 0 })}
                fullWidth
                required
                InputProps={{ endAdornment: <Typography>%</Typography> }}
              />
            )}
            {promotionFormData.promotionType === 'POINTS_MULTIPLIER' && (
              <TextField
                label="Points Multiplier"
                type="number"
                value={promotionFormData.pointsMultiplier || ''}
                onChange={(e) => setPromotionFormData({ ...promotionFormData, pointsMultiplier: parseInt(e.target.value) || 1 })}
                fullWidth
                required
                InputProps={{ endAdornment: <Typography>x</Typography> }}
              />
            )}
            {promotionFormData.promotionType === 'BONUS_POINTS' && (
              <TextField
                label="Bonus Points"
                type="number"
                value={promotionFormData.bonusPoints || ''}
                onChange={(e) => setPromotionFormData({ ...promotionFormData, bonusPoints: parseInt(e.target.value) || 0 })}
                fullWidth
                required
                InputProps={{ endAdornment: <Typography>pts</Typography> }}
              />
            )}
            <TextField
              label="Start Date"
              type="date"
              value={promotionFormData.startDate}
              onChange={(e) => setPromotionFormData({ ...promotionFormData, startDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={promotionFormData.endDate}
              onChange={(e) => setPromotionFormData({ ...promotionFormData, endDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={promotionFormData.isActive}
                  onChange={(e) => setPromotionFormData({ ...promotionFormData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromotionDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSavePromotion} variant="contained" startIcon={<SaveIcon />}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Floating Action Button */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="refresh"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={loadDashboardData}
        >
          <RefreshIcon />
        </Fab>
      </Zoom>
    </Grid>
  );
};

export default AdminDashboard;

