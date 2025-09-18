import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Timer as TimerIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import UnifiedBackendService from '../services/UnifiedBackendService';

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficultyLevel: string;
  pointsReward: number;
  timeLimitMinutes: number;
}

interface EnhancedQuizProps {
  quizId?: string;
  onComplete?: (score: number, pointsEarned: number) => void;
}

const EnhancedQuiz: React.FC<EnhancedQuizProps> = ({ quizId, onComplete }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendService = UnifiedBackendService.getInstance();

    // Start the quiz
    const startQuiz = () => {
      setIsStarted(true);
      setIsCompleted(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
      setPointsEarned(0);
      if (quiz && quiz.timeLimitMinutes) {
        setTimeLeft(quiz.timeLimitMinutes * 60);
      }
    };

  const loadQuiz = React.useCallback(async () => {
    try {
      setLoading(true);
      // Load quiz details and questions from backend
      const quizData = await backendService.getQuizById(quizId!);
      const questionsData = await backendService.getQuizQuestions(quizId!);
      
      setQuiz(quizData);
      setQuestions(questionsData);
      setTimeLeft(quizData.timeLimitMinutes * 60);
    } catch (error) {
      setError('Failed to load quiz');
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  }, [quizId, backendService]);

  const calculateScore = React.useCallback(() => {
    let correctAnswers = 0;
    let totalPoints = 0;

    questions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++;
        totalPoints += question.points;
      }
    });

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setPointsEarned(totalPoints);
    
    if (onComplete) {
      onComplete(finalScore, totalPoints);
    }
  }, [questions, selectedAnswers, setScore, setPointsEarned, onComplete]);

  const handleQuizComplete = React.useCallback(() => {
    setIsCompleted(true);
    calculateScore();
  }, [calculateScore]);

  // Removed duplicate startQuiz function

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading quiz...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!quiz) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No quiz selected
      </Alert>
    );
  }

  if (!isStarted) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {quiz.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {quiz.description}
          </Typography>
          
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Category:</Typography>
              <Chip label={quiz.category} size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Difficulty:</Typography>
              <Chip 
                label={quiz.difficultyLevel} 
                color={getDifficultyColor(quiz.difficultyLevel) as any}
                size="small" 
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Time Limit:</Typography>
              <Chip 
                icon={<TimerIcon />} 
                label={`${quiz.timeLimitMinutes} minutes`} 
                size="small" 
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Points Reward:</Typography>
              <Chip 
                icon={<StarIcon />} 
                label={`${quiz.pointsReward} points`} 
                color="primary" 
                size="small" 
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Questions:</Typography>
              <Chip label={`${questions.length} questions`} size="small" />
            </Box>
          </Stack>

          <Button 
            variant="contained" 
            size="large" 
            onClick={startQuiz}
            startIcon={<AutoAwesomeIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ mb: 3 }}>
            {score >= 70 ? (
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'success.main' }}>
                <TrophyIcon sx={{ fontSize: 40 }} />
              </Avatar>
            ) : (
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'warning.main' }}>
                <StarIcon sx={{ fontSize: 40 }} />
              </Avatar>
            )}
            
            <Typography variant="h4" gutterBottom>
              {score >= 70 ? 'Congratulations!' : 'Quiz Completed'}
            </Typography>
            
            <Typography variant="h6" color="primary" gutterBottom>
              Score: {score}%
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              You earned <strong>{pointsEarned} points</strong>!
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="outlined" 
              onClick={() => setShowResults(true)}
            >
              View Results
            </Button>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = currentQuestion.options.split('|');

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      {/* Quiz Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              {quiz.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                icon={<TimerIcon />} 
                label={formatTime(timeLeft)} 
                color={timeLeft < 60 ? 'error' : 'primary'}
                variant={timeLeft < 60 ? 'filled' : 'outlined'}
              />
              <Chip 
                icon={<StarIcon />} 
                label={`${quiz.pointsReward} pts`} 
                color="primary" 
              />
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {currentQuestion.questionText}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={currentQuestion.difficulty} 
                color={getDifficultyColor(currentQuestion.difficulty) as any}
                size="small" 
              />
              <Chip 
                label={`${currentQuestion.points} pts`} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </Box>

          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Select your answer:</FormLabel>
            <RadioGroup
              value={selectedAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
            >
              {options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                  sx={{
                    p: 2,
                    m: 1,
                    border: '1px solid',
                    borderColor: selectedAnswers[currentQuestion.id] === option ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNextQuestion}
              disabled={!selectedAnswers[currentQuestion.id]}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleQuizComplete}
              disabled={!selectedAnswers[currentQuestion.id]}
              startIcon={<CheckCircleIcon />}
            >
              Complete Quiz
            </Button>
          )}
        </Box>
      </Box>

      {/* Results Dialog */}
      <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="md" fullWidth>
        <DialogTitle>Quiz Results</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {questions.map((question, index) => {
              const selectedAnswer = selectedAnswers[question.id];
              const isCorrect = selectedAnswer === question.correctAnswer;
              
              return (
                <Paper key={question.id} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6">
                      Question {index + 1}
                    </Typography>
                    {isCorrect ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {question.questionText}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Your answer: {selectedAnswer || 'Not answered'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Correct answer: {question.correctAnswer}
                    </Typography>
                  </Box>
                  
                  {question.explanation && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Explanation:</strong> {question.explanation}
                      </Typography>
                    </Alert>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedQuiz;
