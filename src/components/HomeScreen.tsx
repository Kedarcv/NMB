import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  Divider,
  Paper,
  Fade,
  Grow,
  Zoom,
  Badge,
} from '@mui/material';
import {
  Home as HomeIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingIcon,
  Restaurant as DiningIcon,
  LocalOffer as OfferIcon,
  Notifications as NotificationIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  Psychology as BrainIcon,
} from '@mui/icons-material';
import { User } from '../services/UnifiedBackendService';
import UnifiedBackendService from '../services/UnifiedBackendService';
import AIService from '../services/AIService';
import LottieAnimation from './common/LottieAnimation';
import { ANIMATIONS, ANIMATION_PRESETS } from '../utils/animations';

// Quiz Component
interface QuizComponentProps {
  questions: any[];
  onComplete: (score: number, totalQuestions: number) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleFinish = () => {
    const score = calculateScore();
    onComplete(score, questions.length);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Quiz Results
        </Typography>
        <Typography variant="h4" sx={{ color: '#4CAF50', mb: 2 }}>
          {score}/{questions.length} Correct
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          You earned {Math.floor((score / questions.length) * 25)} points!
        </Typography>
        <Button onClick={handleFinish} variant="contained" size="large">
          Complete Quiz
        </Button>
      </Box>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentQuestion];

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Question {currentQuestion + 1} of {questions.length}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {question.question}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {question.options.map((option: string, index: number) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => handleAnswer(index)}
            sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
          >
            {option}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

// Offers Component
interface OffersComponentProps {
  onClaimOffer: (offerId: string, points: number) => void;
  points: number;
}

const OffersComponent: React.FC<OffersComponentProps> = ({ onClaimOffer, points }) => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch offers from the backend
    // For now, we'll use dynamic offers based on available partners
    const dynamicOffers = [
      {
        id: 'nandos-special',
        title: 'Nandos Special Deal',
        description: 'Get 20% off on your next meal at Nandos',
        points: 15,
        partner: 'Nandos Zimbabwe'
      },
      {
        id: 'picknpay-discount',
        title: 'Pick n Pay Discount',
        description: '15% off on groceries this weekend',
        points: 15,
        partner: 'Pick n Pay Zimbabwe'
      },
      {
        id: 'edgars-sale',
        title: 'Edgars Fashion Sale',
        description: 'Up to 30% off on selected clothing items',
        points: 15,
        partner: 'Edgars Zimbabwe'
      }
    ];
    
    setOffers(dynamicOffers);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Available Offers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Skeleton variant="text" width={200} height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width={300} height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width={150} height={20} />
                </Box>
                <Skeleton variant="rectangular" width={100} height={36} />
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Available Offers
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {offers.map((offer) => (
          <Card key={offer.id} elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {offer.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {offer.description}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Partner: {offer.partner}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => onClaimOffer(offer.id, offer.points)}
                disabled={points < offer.points}
              >
                Claim Offer
              </Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

interface HomeScreenProps {
  user: User;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  points: number;
  available: boolean;
}

interface RecentActivity {
  id: string;
  type: 'POINTS_EARNED' | 'POINTS_REDEEMED' | 'TASK_COMPLETED' | 'QUIZ_COMPLETED' | 'LOCATION_CHECKIN';
  title: string;
  description: string;
  points: number;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

interface DailyGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  points: number;
  icon: React.ReactNode;
  color: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const [backendService] = useState(() => UnifiedBackendService.getInstance());
  const [aiService] = useState(() => AIService.getInstance());
  const [loyaltyPoints, setLoyaltyPoints] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<DailyGoal | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Success animation states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successPoints, setSuccessPoints] = useState(0);
  
  // Task verification dialogs
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    task: string;
    points: number;
    actionType: string;
  }>({ open: false, task: '', points: 0, actionType: '' });
  
  const [quizDialog, setQuizDialog] = useState<{
    open: boolean;
    questions: any[];
    score?: number;
  }>({ open: false, questions: [] });
  
  const [locationVerificationDialog, setLocationVerificationDialog] = useState<{
    open: boolean;
    points: number;
  }>({ open: false, points: 0 });
  
  const [offersDialog, setOffersDialog] = useState<{
    open: boolean;
    points: number;
  }>({ open: false, points: 0 });

  const [adWatchingDialog, setAdWatchingDialog] = useState<{
    open: boolean;
    points: number;
  }>({ open: false, points: 0 });

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Load user data in parallel
      const [points, transactions] = await Promise.all([
        backendService.getLoyaltyPoints(user.id),
        backendService.getUserTransactions(user.id),
      ]);

      setLoyaltyPoints(points);
      setRecentTransactions(transactions || []);

      // Initialize daily goals
      const goals: DailyGoal[] = [
        {
          id: '1',
          title: 'Daily Login',
          current: 1,
          target: 1,
          points: 10,
          icon: <CheckIcon />,
          color: '#4CAF50',
        },
        {
          id: '2',
          title: 'Complete Tasks',
          current: 0,
          target: 3,
          points: 50,
          icon: <CheckIcon />,
          color: '#2196F3',
        },
        {
          id: '3',
          title: 'Earn Points',
          current: points?.pointsBalance || 0,
          target: 100,
          points: 25,
          icon: <TrendingIcon />,
          color: '#FF9800',
        },
        {
          id: '4',
          title: 'Visit Locations',
          current: 0,
          target: 2,
          points: 30,
          icon: <DiningIcon />,
          color: '#9C27B0',
        },
      ];
      setDailyGoals(goals);

              // Initialize quick actions with Zimbabwean business focus
        const actions: QuickAction[] = [
          {
            id: '1',
            title: 'AI Quiz',
            description: 'AI-generated questions about Zimbabwean businesses and local partners',
            icon: <BrainIcon />,
            action: () => handleQuickAction('quiz'),
            color: '#9C27B0',
            points: 25,
            available: true,
          },
          {
            id: '2',
            title: 'GPS Check-in',
            description: 'Verify your location at partner businesses using Maps API integration',
            icon: <DiningIcon />,
            action: () => handleQuickAction('checkin'),
            color: '#4CAF50',
            points: 20,
            available: true,
          },
          {
            id: '3',
            title: 'Special Offers',
            description: 'Browse limited-time deals from Zimbabwean partners',
            icon: <OfferIcon />,
            action: () => handleQuickAction('offers'),
            color: '#FF9800',
            points: 15,
            available: true,
          },
          {
            id: '4',
            title: 'Watch Ads',
            description: 'Watch Zimbabwean business ads to earn 3 points each (10/day limit)',
            icon: <PlayIcon />,
            action: () => handleQuickAction('ads'),
            color: '#FF5722',
            points: 3,
            available: true,
          },
          {
            id: '5',
            title: 'Redeem Rewards',
            description: 'Use your points for exciting rewards from local businesses',
            icon: <TrophyIcon />,
            action: () => handleQuickAction('rewards'),
            color: '#2196F3',
            points: 0,
            available: (points?.pointsBalance || 0) >= 100,
          },
        ];
      setQuickActions(actions);

      // Generate recent activities from transactions
      const activities: RecentActivity[] = (transactions || []).slice(0, 5).map((tx, index) => ({
        id: tx.id,
        type: tx.type === 'EARN' ? 'POINTS_EARNED' : 'POINTS_REDEEMED',
        title: tx.type === 'EARN' ? 'Points Earned' : 'Points Redeemed',
        description: tx.reason,
        points: tx.points,
        timestamp: new Date(tx.timestamp).toLocaleDateString(),
        icon: tx.type === 'EARN' ? <TrendingIcon /> : <ShoppingIcon />,
        color: tx.type === 'EARN' ? '#4CAF50' : '#FF9800',
      }));

      // Add some default activities if none exist
      if (activities.length === 0) {
        activities.push(
          {
            id: 'default1',
            type: 'TASK_COMPLETED',
            title: 'Welcome Bonus',
            description: 'First time login reward for Zimbabwean loyalty program',
            points: 50,
            timestamp: new Date().toLocaleDateString(),
            icon: <StarIcon />,
            color: '#FFD700',
          },
          {
            id: 'default2',
            type: 'QUIZ_COMPLETED',
            title: 'Profile Setup',
            description: 'Completed profile information for local rewards',
            points: 25,
            timestamp: new Date().toLocaleDateString(),
            icon: <CheckIcon />,
            color: '#4CAF50',
          }
        );
      }

      setRecentActivities(activities);

    } catch (error) {
      console.error('Failed to load home data:', error);
      showNotificationMessage('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (actionType: string) => {
    try {
      let points = 0;
      let message = '';
      let requiresVerification = false;
      let verificationTask = '';

      switch (actionType) {
        case 'quiz':
          requiresVerification = true;
          verificationTask = 'Complete a 5-question AI-generated quiz about Zimbabwean businesses';
          points = 25;
          break;
        case 'checkin':
          requiresVerification = true;
          verificationTask = 'Visit a partner location and verify with GPS using Maps API';
          points = 20;
          break;
        case 'offers':
          requiresVerification = true;
          verificationTask = 'View and claim a special offer from partners';
          points = 15;
          break;
        case 'ads':
          requiresVerification = true;
          verificationTask = 'Watch Zimbabwean business ads to earn points (3 points per ad, 10 ads per day)';
          points = 3;
          break;
        case 'rewards':
          message = 'Redirecting to rewards catalog...';
          break;
      }

      if (requiresVerification) {
        setVerificationDialog({
          open: true,
          task: verificationTask,
          points: points,
          actionType: actionType
        });
      } else if (actionType === 'rewards') {
        showNotificationMessage(message);
      }
    } catch (error) {
      console.error('Quick action failed:', error);
      showNotificationMessage('Action failed. Please try again.');
    }
  };

  const handleTaskVerification = async (actionType: string, points: number) => {
    try {
      // Simulate task verification process
      let verificationSuccess = false;
      
      switch (actionType) {
        case 'quiz':
          // Show quiz questions
          generateQuizQuestions().then(questions => {
            setQuizDialog({ open: true, questions });
          });
          return;
        case 'checkin':
          // Show location verification
          setLocationVerificationDialog({ open: true, points: points });
          return;
        case 'offers':
          // Show offers selection
          setOffersDialog({ open: true, points: points });
          return;
        case 'ads':
          // Show ad watching selection
          setAdWatchingDialog({ open: true, points: points });
          return;
      }
    } catch (error) {
      console.error('Task verification failed:', error);
      showNotificationMessage('Verification failed. Please try again.');
    }
  };

  const generateQuizQuestions = async () => {
    try {
      // Get user level to determine difficulty
      const userLevel = getCurrentLevel();
      const difficulty = userLevel <= 3 ? 'EASY' : userLevel <= 7 ? 'MEDIUM' : 'HARD';
      
      const questions = await backendService.generateQuizQuestions(
        'Zimbabwean Business',
        difficulty,
        5,
        'Local Partners'
      );
      return questions;
    } catch (error) {
      console.error('Failed to generate AI quiz questions:', error);
      throw new Error('Failed to generate quiz questions. Please try again.');
    }
  };

  const handleQuizCompletion = async (score: number, totalQuestions: number) => {
    try {
      // Submit quiz to backend for processing
      const result = await backendService.submitQuizAnswers(
        quizDialog.questions,
        [], // We'll need to track answers during the quiz
        Math.floor(Math.random() * 300) + 60, // Simulate time taken (1-6 minutes)
        'Zimbabwean Business',
        'MEDIUM'
      );
      
      if (result.success) {
        const message = `Quiz completed! Score: ${result.score}/${result.totalQuestions}. You earned ${result.pointsEarned} points.`;
        showNotificationMessage(message);
        loadHomeData(); // Refresh data
      } else {
        showNotificationMessage('Quiz completed but there was an issue processing results.');
      }
      
      setQuizDialog({ open: false, questions: [], score: 0 });
    } catch (error) {
      console.error('Quiz completion failed:', error);
      showNotificationMessage('Failed to process quiz results.');
    }
  };

  const handleLocationVerification = async (verified: boolean, points: number) => {
    try {
      if (verified) {
        // Get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Verify location with backend using Maps API
                const result = await backendService.verifyLocation(
                  position.coords.latitude,
                  position.coords.longitude,
                  '1', // Default partner ID - in real app, this would be selected
                  'GPS'
                );
                
                if (result.success && result.verified) {
                  showNotificationMessage(`Check-in verified! You earned ${result.pointsEarned} points at ${result.partnerName}.`);
                  loadHomeData(); // Refresh data
                } else {
                  showNotificationMessage(result.message || 'Location verification failed. Please ensure you are at a partner location.');
                }
              } catch (error) {
                console.error('Location verification failed:', error);
                showNotificationMessage('Location verification failed. Please try again.');
              }
            },
            (error) => {
              console.error('Geolocation error:', error);
              showNotificationMessage('Unable to get your location. Please enable location services.');
            }
          );
        } else {
          showNotificationMessage('Geolocation is not supported by this browser.');
        }
      }
      
      setLocationVerificationDialog({ open: false, points: 0 });
    } catch (error) {
      console.error('Location verification failed:', error);
      showNotificationMessage('Verification failed. Please try again.');
    }
  };

  const handleOfferClaim = async (offerId: string, points: number) => {
    try {
      // In a real app, this would call the backend to claim the offer
      // For now, we'll simulate the backend call
      await backendService.addLoyaltyPoints(user.id, points, `Special offer claimed: ${offerId}`);
      showNotificationMessage('Offer claimed successfully! You earned 15 points.');
      loadHomeData(); // Refresh data
      
      setOffersDialog({ open: false, points: 0 });
    } catch (error) {
      console.error('Offer claim failed:', error);
      showNotificationMessage('Failed to claim offer. Please try again.');
    }
  };

  const handleGoalClick = (goal: DailyGoal) => {
    setSelectedGoal(goal);
    setShowGoalDialog(true);
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const getLevelProgress = () => {
    if (!loyaltyPoints) return 0;
    const totalPoints = loyaltyPoints.pointsBalance || 0;
    const currentLevel = Math.floor(totalPoints / 100) + 1;
    const levelStart = (currentLevel - 1) * 100;
    const levelProgress = totalPoints - levelStart;
    return (levelProgress / 100) * 100;
  };

  const getCurrentLevel = () => {
    if (!loyaltyPoints) return 1;
    const totalPoints = loyaltyPoints.pointsBalance || 0;
    return Math.floor(totalPoints / 100) + 1;
  };

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 8 }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)', color: 'white', py: 3, px: 2 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Home</Typography>
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ mt: -2, px: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Box key={item}>
                <Card elevation={2} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
                    <Skeleton variant="text" height={24} width="80%" sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

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
                Welcome back, {user.firstName}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Ready to earn more points and unlock rewards from Zimbabwean businesses?
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={loadHomeData} sx={{ color: 'white' }}>
                <RefreshIcon />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -2, px: 2 }}>
        {/* Loyalty Points Overview */}
        <Card elevation={4} sx={{ borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Badge
                badgeContent={getCurrentLevel()}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '1.2rem',
                    height: '2rem',
                    minWidth: '2rem',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#1976D2',
                    fontSize: 32,
                    mr: 3,
                    border: '4px solid white',
                  }}
                >
                  <StarIcon />
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1565C0', mb: 1 }}>
                  {loyaltyPoints?.pointsBalance?.toLocaleString() || 0} Points
                </Typography>
                <Typography variant="body1" sx={{ color: '#1976D2', mb: 2 }}>
                  Level {getCurrentLevel()} • {loyaltyPoints?.totalEarned || 0} total earned
                </Typography>
                
                {/* Level Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Level {getCurrentLevel()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {loyaltyPoints?.pointsBalance || 0} / {(getCurrentLevel() * 100)} pts
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={getLevelProgress()} 
                    sx={{ height: 12, borderRadius: 6, backgroundColor: '#BBDEFB' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<FireIcon />}
                    label={`${Math.floor(Math.random() * 30) + 1} Day Streak`}
                    color="warning"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip
                    icon={<TrendingIcon />}
                    label={`${loyaltyPoints?.totalRedeemed || 0} Redeemed`}
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Daily Goals */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Daily Goals
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          {dailyGoals.map((goal, index) => (
            <Box key={goal.id}>
              <Grow in timeout={200 * index}>
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
                  onClick={() => handleGoalClick(goal)}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: `${goal.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: goal.color,
                      }}
                    >
                      {goal.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {goal.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {goal.current} / {goal.target}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(goal.current / goal.target) * 100}
                      sx={{ height: 6, borderRadius: 3, mb: 2 }}
                    />
                    <Chip
                      label={`${goal.points} pts`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grow>
            </Box>
          ))}
        </Box>

        {/* Quick Actions */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Quick Actions
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          {quickActions.map((action, index) => (
            <Box key={action.id}>
              <Zoom in timeout={300 * index}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    cursor: action.available ? 'pointer' : 'default',
                    opacity: action.available ? 1 : 0.6,
                    transition: 'all 0.3s ease',
                    '&:hover': action.available ? {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    } : {},
                  }}
                  onClick={action.available ? action.action : undefined}
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
                        color: action.color,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {action.description}
                    </Typography>
                    <Chip
                      label={`${action.points} pts`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          ))}
        </Box>

        {/* Recent Activity */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Recent Activity
        </Typography>
        
        <Card elevation={2} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 0 }}>
            <List>
              {recentActivities.map((activity, index) => (
                <Box key={activity.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          backgroundColor: `${activity.color}20`,
                          color: activity.color,
                          width: 50,
                          height: 50,
                        }}
                      >
                        {activity.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {activity.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {activity.description} • {activity.timestamp}
                        </Typography>
                      }
                    />
                    <Chip
                      label={`${activity.points > 0 ? '+' : ''}${activity.points} pts`}
                      color={activity.points > 0 ? 'success' : 'warning'}
                      variant="filled"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>

      {/* Goal Detail Dialog */}
      <Dialog
        open={showGoalDialog}
        onClose={() => setShowGoalDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedGoal?.title}
            </Typography>
            <IconButton onClick={() => setShowGoalDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedGoal && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: `${selectedGoal.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: selectedGoal.color,
                  }}
                >
                  {selectedGoal.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedGoal.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Complete this goal to earn {selectedGoal.points} points
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedGoal.current} / {selectedGoal.target}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(selectedGoal.current / selectedGoal.target) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Keep up the great work! You're making excellent progress toward your daily goals.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setShowGoalDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

             {/* Task Verification Dialog */}
       <Dialog
         open={verificationDialog.open}
         onClose={() => setVerificationDialog({ open: false, task: '', points: 0, actionType: '' })}
         maxWidth="sm"
         fullWidth
         PaperProps={{ sx: { borderRadius: 3 } }}
       >
         <DialogTitle sx={{ pb: 1 }}>
           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
             Task Verification Required
           </Typography>
         </DialogTitle>
         <DialogContent>
           <Typography variant="body1" sx={{ mb: 2 }}>
             {verificationDialog.task}
           </Typography>
           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
             Complete this task to earn {verificationDialog.points} points
           </Typography>
         </DialogContent>
         <DialogActions sx={{ p: 3, pt: 1 }}>
           <Button 
             onClick={() => setVerificationDialog({ open: false, task: '', points: 0, actionType: '' })}
             variant="outlined"
           >
             Cancel
           </Button>
           <Button 
             onClick={() => {
               setVerificationDialog({ open: false, task: '', points: 0, actionType: '' });
               handleTaskVerification(verificationDialog.actionType, verificationDialog.points);
             }}
             variant="contained"
           >
             Start Task
           </Button>
         </DialogActions>
       </Dialog>

       {/* Quiz Dialog */}
       <Dialog
         open={quizDialog.open}
         onClose={() => setQuizDialog({ open: false, questions: [] })}
         maxWidth="md"
         fullWidth
         PaperProps={{ sx: { borderRadius: 3 } }}
       >
         <DialogTitle>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <BrainIcon color="primary" />
             <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
               AI-Generated Zimbabwean Business Quiz
             </Typography>
           </Box>
           <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
             Questions are dynamically generated by AI based on local business knowledge
           </Typography>
         </DialogTitle>
         <DialogContent>
           <QuizComponent 
             questions={quizDialog.questions}
             onComplete={handleQuizCompletion}
           />
         </DialogContent>
       </Dialog>

       {/* Location Verification Dialog */}
       <Dialog
         open={locationVerificationDialog.open}
         onClose={() => setLocationVerificationDialog({ open: false, points: 0 })}
         maxWidth="sm"
         fullWidth
         PaperProps={{ sx: { borderRadius: 3 } }}
       >
         <DialogTitle>
           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
             Location Check-in Verification
           </Typography>
         </DialogTitle>
         <DialogContent>
           <Typography variant="body1" sx={{ mb: 2 }}>
             To verify your location check-in, please:
           </Typography>
           <Box sx={{ mb: 3 }}>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
               • Visit a partner location (Nandos, Pick n Pay, Edgars, etc.)
             </Typography>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
               • Ensure your device location services are enabled
             </Typography>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
               • Click "Verify Check-in" to use GPS verification
             </Typography>
             <Typography variant="body2" color="text.secondary">
               • Our system will verify your location using Maps API
             </Typography>
           </Box>
           <Alert severity="info" sx={{ mb: 2 }}>
             <Typography variant="body2">
               <strong>Note:</strong> Location verification uses Google Maps API to ensure you are actually at the partner location. 
               You must be within 100 meters of the business to earn points.
             </Typography>
           </Alert>
         </DialogContent>
         <DialogActions sx={{ p: 3, pt: 1 }}>
           <Button 
             onClick={() => setLocationVerificationDialog({ open: false, points: 0 })}
             variant="outlined"
           >
             Cancel
           </Button>
           <Button 
             onClick={() => handleLocationVerification(true, locationVerificationDialog.points)}
             variant="contained"
             startIcon={<DiningIcon />}
           >
             Verify Check-in with GPS
           </Button>
         </DialogActions>
       </Dialog>

       {/* Offers Dialog */}
       <Dialog
         open={offersDialog.open}
         onClose={() => setOffersDialog({ open: false, points: 0 })}
         maxWidth="md"
         fullWidth
         PaperProps={{ sx: { borderRadius: 3 } }}
       >
         <DialogTitle>
           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
             Special Offers from Partners
           </Typography>
         </DialogTitle>
         <DialogContent>
           <OffersComponent 
             onClaimOffer={handleOfferClaim}
             points={offersDialog.points}
           />
         </DialogContent>
       </Dialog>

       {/* Notification Snackbar */}
       <Dialog
         open={showNotification}
         onClose={() => setShowNotification(false)}
         maxWidth="xs"
         fullWidth
         PaperProps={{
           sx: { borderRadius: 3 }
         }}
       >
         <DialogContent sx={{ p: 3, textAlign: 'center' }}>
           <CheckIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
           <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
             Success!
           </Typography>
           <Typography variant="body1" color="text.secondary">
             {notificationMessage}
           </Typography>
         </DialogContent>
       </Dialog>

       {/* Success Animation Overlay */}
       {showSuccessAnimation && (
         <Box
           sx={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             backgroundColor: 'rgba(0, 0, 0, 0.8)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             zIndex: 9999,
             pointerEvents: 'none',
           }}
         >
           <Box sx={{ textAlign: 'center', color: 'white' }}>
             <Box sx={{ width: 200, height: 200, margin: '0 auto' }}>
               <LottieAnimation
                 animationPath={ANIMATIONS.SUCESSO}
                 {...ANIMATION_PRESETS.SUCCESS}
                 style={{ width: '100%', height: '100%' }}
               />
             </Box>
             <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
               {successMessage}
             </Typography>
             {successPoints > 0 && (
               <Typography variant="h5" sx={{ mt: 1, color: '#FFD700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                 +{successPoints} Points!
               </Typography>
             )}
           </Box>
         </Box>
       )}
     </Box>
   );
 };

export default HomeScreen;
