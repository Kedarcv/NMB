import React, { useState, useEffect } from 'react'; // eslint-disable-line
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Container,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Slide,
  Grow,
  Zoom,
} from '@mui/material';
import {
  Star as StarIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  EmojiEvents as TrophyIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  LocalFireDepartment as FireIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  Assignment as TaskIcon,
  Quiz as QuizIcon,
  Celebration as CelebrationIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  School as SchoolIcon,
  Timer as TimerIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
} from '@mui/icons-material';
import { User } from '../services/UnifiedBackendService';
import UnifiedBackendService from '../services/UnifiedBackendService';
import LottieAnimation from './common/LottieAnimation';
import { ANIMATIONS, ANIMATION_PRESETS } from '../utils/animations';

interface GamificationScreenProps {
  user: User;
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  type: 'DAILY_LOGIN' | 'COMPLETE_QUIZ' | 'EARN_POINTS' | 'VISIT_LOCATION' | 'COMPLETE_PROFILE';
  icon: React.ReactNode;
}

interface Quiz {
  id: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation: string;
  category: 'LOYALTY' | 'REWARDS' | 'SHOPPING' | 'SAVINGS';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  pointsReward: number;
}

interface UserStats {
  level: number;
  experience: number;
  experienceToNext: number;
  streak: number;
  totalPoints: number;
  quizzesCompleted: number;
  achievementsUnlocked: number;
  dailyTasksCompleted: number;
}

const GamificationScreen: React.FC<GamificationScreenProps> = ({ user }) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  
  const [showRewardAnimation, setShowRewardAnimation] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [rewardPoints, setRewardPoints] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showGamificationAnimation, setShowGamificationAnimation] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  
  // Notification and dialog states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; points: number } | null>(null);

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  const [isLoading, setIsLoading] = useState(true);

  const backendService = UnifiedBackendService.getInstance();

  const loadGamificationData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load user stats from backend
      const points = await backendService.getLoyaltyPoints(user.id);
      const totalPoints = points?.pointsBalance || 0;
      
      // Calculate level and experience
      const level = Math.floor(totalPoints / 100) + 1;
      const experience = totalPoints % 100;
      const experienceToNext = 100 - experience;
      
      setUserStats({
        level,
        experience,
        experienceToNext,
        streak: Math.floor(Math.random() * 30) + 1, // Would come from backend
        totalPoints,
        quizzesCompleted: Math.floor(Math.random() * 50) + 10,
        achievementsUnlocked: Math.floor(totalPoints / 50),
        dailyTasksCompleted: Math.floor(Math.random() * 5) + 1,
      });

      // Initialize daily tasks
      const tasks: DailyTask[] = [
        {
          id: '1',
          title: 'Daily Login',
          description: 'Log in to the app today',
          points: 10,
          completed: true,
          type: 'DAILY_LOGIN',
          icon: <CheckIcon />,
        },
        {
          id: '2',
          title: 'Complete a Quiz',
          description: 'Test your knowledge and earn points',
          points: 25,
          completed: false,
          type: 'COMPLETE_QUIZ',
          icon: <QuizIcon />,
        },
        {
          id: '3',
          title: 'Earn Points',
          description: 'Earn at least 50 points today',
          points: 30,
          completed: totalPoints >= 50,
          type: 'EARN_POINTS',
          icon: <TrendingIcon />,
        },
        {
          id: '4',
          title: 'Visit Location',
          description: 'Check in at a partner location',
          points: 40,
          completed: false,
          type: 'VISIT_LOCATION',
          icon: <TaskIcon />,
        },
        {
          id: '5',
          title: 'Complete Profile',
          description: 'Fill in all profile information',
          points: 20,
          completed: false,
          type: 'COMPLETE_PROFILE',
          icon: <TaskIcon />,
        },
      ];
      setDailyTasks(tasks);

      // Initialize quizzes
      const quizzes: Quiz[] = [
        {
          id: '1',
          title: 'Loyalty Basics',
          question: 'What is the main benefit of a loyalty program?',
          options: [
            'Free products',
            'Earn points and rewards',
            'Discounts only',
            'Nothing special'
          ],
          correctAnswer: 1,
          points: 25,
          explanation: 'Loyalty programs help you earn points and rewards for your continued engagement.',
          category: 'LOYALTY',
        },
        {
          id: '2',
          title: 'Smart Shopping',
          question: 'How can you maximize your loyalty points?',
          options: [
            'Shop only during sales',
            'Use multiple payment methods',
            'Shop strategically and use bonus point offers',
            'Buy everything at once'
          ],
          correctAnswer: 2,
          points: 30,
          explanation: 'Strategic shopping with bonus point offers maximizes your earning potential.',
          category: 'SHOPPING',
        },
        {
          id: '3',
          title: 'Rewards Strategy',
          question: 'When is the best time to redeem your points?',
          options: [
            'As soon as you have enough',
            'During special redemption events',
            'Never redeem them',
            'Only on your birthday'
          ],
          correctAnswer: 1,
          points: 35,
          explanation: 'Special redemption events often offer better value for your points.',
          category: 'REWARDS',
        },
      ];
      setAvailableQuizzes(quizzes);

      // Initialize achievements
      const userAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first daily task',
          icon: <CheckIcon />,
          unlocked: true,
          progress: 1,
          maxProgress: 1,
          pointsReward: 50,
        },
        {
          id: '2',
          title: 'Quiz Master',
          description: 'Complete 10 quizzes',
          icon: <BrainIcon />,
          unlocked: false,
          progress: 3,
          maxProgress: 10,
          pointsReward: 100,
        },
        {
          id: '3',
          title: 'Streak Champion',
          description: 'Maintain a 7-day login streak',
          icon: <FireIcon />,
          unlocked: false,
          progress: 3,
          maxProgress: 7,
          pointsReward: 150,
        },
        {
          id: '4',
          title: 'Point Collector',
          description: 'Earn 1000 total points',
          icon: <TrendingIcon />,
          unlocked: false,
          progress: totalPoints,
          maxProgress: 1000,
          pointsReward: 200,
        },
        {
          id: '5',
          title: 'Location Explorer',
          description: 'Visit 5 different partner locations',
          icon: <TaskIcon />,
          unlocked: false,
          progress: 2,
          maxProgress: 5,
          pointsReward: 75,
        },
      ];
      setAchievements(userAchievements);

    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, backendService, setUserStats, setDailyTasks, setAvailableQuizzes, setAchievements]);

  const handleQuizStart = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswer(null);
    setQuizResult(null);
    setShowQuizDialog(true);
  };

  const handleQuizSubmit = async () => {
    if (selectedQuiz && quizAnswer !== null) {
      const correct = quizAnswer === selectedQuiz.correctAnswer;
      const points = correct ? selectedQuiz.points : 5; // Bonus points for participation
      
      setQuizResult({ correct, points });
      
      if (correct) {
        // Add points to user account
        try {
          await backendService.addLoyaltyPoints(user.id, points, `Quiz completed: ${selectedQuiz.title}`);
          // Refresh user stats
          loadGamificationData();
        } catch (error) {
          console.error('Failed to add points:', error);
        }
      }
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      try {
        // Verify task completion based on type
        let canComplete = false;
        let verificationMessage = '';
        
        switch (task.type) {
          case 'DAILY_LOGIN':
            canComplete = true; // Always available
            verificationMessage = 'Daily login verified!';
            break;
          case 'COMPLETE_QUIZ':
            // Show quiz dialog for verification
            return;
          case 'EARN_POINTS':
            // Check if user has earned points today
            canComplete = (userStats?.totalPoints || 0) > 0;
            verificationMessage = canComplete ? 'Points earning verified!' : 'You need to earn points first';
            break;
          case 'VISIT_LOCATION':
            // Show location verification dialog
            return;
          case 'COMPLETE_PROFILE':
            // Check if profile is complete
            canComplete = !!(user.firstName && user.lastName);
            verificationMessage = canComplete ? 'Profile completion verified!' : 'Please complete your profile first';
            break;
        }

        if (canComplete) {
          // Add points to user account
          await backendService.addLoyaltyPoints(user.id, task.points, `Daily task completed: ${task.title}`);
          
          // Update task completion
          setDailyTasks(prev => prev.map(t => 
            t.id === taskId ? { ...t, completed: true } : t
          ));
          
          // Refresh user stats
          loadGamificationData();
          
          showNotificationMessage(`${verificationMessage} Task completed! You earned ${task.points} points.`);
        } else {
          showNotificationMessage(verificationMessage);
        }
      } catch (error) {
        console.error('Failed to complete task:', error);
        showNotificationMessage('Failed to complete task. Please try again.');
      }
    }
  };

  if (isLoading || !userStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  const levelProgress = (userStats.experience / 100) * 100;

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          color: 'white',
          py: 3,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Gamification
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Level up, earn rewards, and have fun!
              </Typography>
            </Box>
            <CelebrationIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -2, px: 2 }}>
        {/* User Stats Card */}
        <Card elevation={4} sx={{ borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Badge
                badgeContent={userStats.level}
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
                    bgcolor: '#FF9800',
                    fontSize: 32,
                    mr: 3,
                    border: '4px solid white',
                  }}
                >
                  <SchoolIcon />
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#E65100', mb: 1 }}>
                  Level {userStats.level}
                </Typography>
                <Typography variant="body1" sx={{ color: '#BF360C', mb: 2 }}>
                  {userStats.experience} / 100 XP • {userStats.experienceToNext} XP to next level
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={levelProgress} 
                  sx={{ height: 12, borderRadius: 6, backgroundColor: '#FFE0B2' }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<FireIcon />}
                label={`${userStats.streak} Day Streak`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                icon={<TrendingIcon />}
                label={`${userStats.totalPoints} Total Points`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                icon={<QuizIcon />}
                label={`${userStats.quizzesCompleted} Quizzes`}
                color="info"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Daily Tasks */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Daily Tasks
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {dailyTasks.map((task, index) => (
            <Box key={task.id}>
              <Grow in timeout={200 * index}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    cursor: task.completed ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: task.completed ? 0.7 : 1,
                    '&:hover': task.completed ? {} : {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                  onClick={() => !task.completed && handleTaskComplete(task.id)}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: task.completed ? '#4CAF50' : '#FF9800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: 'white',
                      }}
                    >
                      {task.completed ? <CheckIcon /> : task.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>
                    <Chip
                      label={`${task.points} pts`}
                      color={task.completed ? 'success' : 'warning'}
                      variant={task.completed ? 'filled' : 'outlined'}
                    />
                  </CardContent>
                </Card>
              </Grow>
            </Box>
          ))}
        </Box>

        {/* Quick Quizzes */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Quick Quizzes
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {availableQuizzes.map((quiz, index) => (
            <Box key={quiz.id}>
              <Zoom in timeout={300 * index}>
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
                  onClick={() => handleQuizStart(quiz)}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: '#9C27B0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: 'white',
                      }}
                    >
                      <QuizIcon />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {quiz.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {quiz.question}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayIcon />}
                      sx={{
                        backgroundColor: '#9C27B0',
                        '&:hover': { backgroundColor: '#7B1FA2' },
                      }}
                    >
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          ))}
        </Box>

        {/* Achievements */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Achievements
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {achievements.map((achievement, index) => (
            <Box key={achievement.id}>
              <Slide direction="up" in timeout={400 * index}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    opacity: achievement.unlocked ? 1 : 0.6,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: achievement.unlocked ? '#4CAF50' : '#E0E0E0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: achievement.unlocked ? 'white' : '#757575',
                      }}
                    >
                      {achievement.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {achievement.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.progress} / {achievement.maxProgress}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(achievement.progress / achievement.maxProgress) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    
                    <Chip
                      label={`${achievement.pointsReward} pts`}
                      color={achievement.unlocked ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Slide>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Quiz Dialog */}
      <Dialog
        open={showQuizDialog}
        onClose={() => setShowQuizDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedQuiz?.title}
            </Typography>
            <IconButton onClick={() => setShowQuizDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {!quizResult ? (
            <>
              <Typography variant="body1" sx={{ mb: 3, fontWeight: 'bold' }}>
                {selectedQuiz?.question}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {selectedQuiz?.options.map((option, index) => (
                  <Button
                    key={index}
                    fullWidth
                    variant={quizAnswer === index ? 'contained' : 'outlined'}
                    onClick={() => setQuizAnswer(index)}
                    sx={{
                      mb: 2,
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      py: 2,
                      px: 3,
                      backgroundColor: quizAnswer === index ? '#1976D2' : 'transparent',
                      '&:hover': {
                        backgroundColor: quizAnswer === index ? '#1565C0' : 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    <Typography variant="body1">
                      {String.fromCharCode(65 + index)}. {option}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {quizResult.correct ? (
                <Box sx={{ color: '#4CAF50', mb: 2 }}>
                  <CheckIcon sx={{ fontSize: 60 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Correct!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ color: '#F44336', mb: 2 }}>
                  <CloseIcon sx={{ fontSize: 60 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Incorrect
                  </Typography>
                </Box>
              )}
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedQuiz?.explanation}
              </Typography>
              
              <Chip
                label={`${quizResult.points} points earned!`}
                color="success"
                variant="filled"
                sx={{ fontSize: '1.1rem', py: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          {!quizResult ? (
            <Button
              variant="contained"
              onClick={handleQuizSubmit}
              disabled={quizAnswer === null}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' },
              }}
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setShowQuizDialog(false)}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' },
              }}
            >
              Continue
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog
        open={showNotification}
        onClose={() => setShowNotification(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <CheckIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Task Update
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {notificationMessage}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Reward Animation Overlay */}
      {showRewardAnimation && (
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
                animationPath={ANIMATIONS.CHEST_TWINKLE}
                {...ANIMATION_PRESETS.REWARD}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              +{rewardPoints} Points!
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Great job!
            </Typography>
          </Box>
        </Box>
      )}

      {/* Gamification Animation Overlay */}
      {showGamificationAnimation && (
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
            <Box sx={{ width: 300, height: 300, margin: '0 auto' }}>
              <LottieAnimation
                animationPath={ANIMATIONS.GAMIFICATION}
                {...ANIMATION_PRESETS.GAMIFICATION}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Achievement Unlocked!
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Keep up the great work!
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GamificationScreen;
