import React, { useState, useEffect } from 'react'; // eslint-disable-line
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
  Skeleton,
  Paper,
  Slide,
  Grow,
  Zoom,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  TrendingUp as TrendingIcon,
  Lightbulb as InsightIcon,
  Analytics as AnalyticsIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  Timeline as TimelineIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  Assessment as AssessmentIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Speed as SpeedIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  CalendarToday as CalendarIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  LocationOn as LocationIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  ShoppingCart as ShoppingIcon,
  Restaurant as DiningIcon, // eslint-disable-line @typescript-eslint/no-unused-vars
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { User } from '../services/UnifiedBackendService';
import UnifiedBackendService from '../services/UnifiedBackendService';
import AIService, { 
  AIRecommendation, 
  PredictiveInsight, 
  UserBehaviorPattern,
  SentimentAnalysisResult 
} from '../services/AIService';

interface InsightsScreenProps {
  user: User;
}

interface InsightMetrics {
  totalRecommendations: number;
  highPriorityActions: number;
  estimatedValue: number;
  accuracyScore: number;
  lastUpdated: string;
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ user }) => {
  const [aiService] = useState(() => AIService.getInstance());
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<UserBehaviorPattern[]>([]);
  const [insightMetrics, setInsightMetrics] = useState<InsightMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<PredictiveInsight | null>(null);
  const [showInsightDialog, setShowInsightDialog] = useState(false);
  const [sentimentText, setSentimentText] = useState('');
  const [sentimentResult, setSentimentResult] = useState<SentimentAnalysisResult | null>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [showSentimentDialog, setShowSentimentDialog] = useState(false);

  const loadInsights = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Initialize AI service
      await aiService.initialize();
      
      const backendService = UnifiedBackendService.getInstance();
      const loyaltyPoints = await backendService.getLoyaltyPoints(user.id);

      // Load user data for AI analysis
      const userData = {
        pointsBalance: loyaltyPoints?.pointsBalance || 0,
        recentActivity: 'High engagement, completed daily tasks', // This can be fetched from transactions
        preferredCategories: 'Dining, Shopping, Entertainment', // This can be inferred from behavior
        engagementLevel: 'High', // This can be calculated
        lastLogin: new Date().toISOString(), // This should be stored for the user
        totalPoints: loyaltyPoints?.totalEarned || 0,
        streak: 15, // This should be calculated and stored
      };

      // Load all insights in parallel
      const [recs, insights, patterns] = await Promise.all([
        aiService.generateRecommendations(user.id, userData),
        aiService.generatePredictiveInsights(user.id, userData),
        aiService.analyzeUserBehavior(user.id, userData),
      ]);

      setRecommendations(recs);
      setPredictiveInsights(insights);
      setBehaviorPatterns(patterns);

      // Calculate metrics
      const metrics: InsightMetrics = {
        totalRecommendations: recs.length,
        highPriorityActions: recs.filter(r => r.priority === 'HIGH').length,
        estimatedValue: recs.reduce((sum, r) => sum + r.estimatedValue, 0),
        accuracyScore: 0.87, // This would come from AI model performance
        lastUpdated: new Date().toLocaleString(),
      };
      setInsightMetrics(metrics);

    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [aiService, user.id]);

  const handleInsightClick = (insight: PredictiveInsight) => {
    setSelectedInsight(insight);
    setShowInsightDialog(true);
  };

  const handleSentimentAnalysis = async () => {
    if (!sentimentText.trim()) return;

    try {
      setIsAnalyzingSentiment(true);
      const result = await aiService.analyzeSentiment(sentimentText, user.id);
      setSentimentResult(result);
      setShowSentimentDialog(true);
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'CHURN_RISK': return <WarningIcon />;
      case 'ENGAGEMENT_OPPORTUNITY': return <TrendingIcon />;
      case 'SPENDING_PATTERN': return <ShoppingIcon />;
      case 'REWARD_PREFERENCE': return <StarIcon />;
      default: return <InsightIcon />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'CHURN_RISK': return '#F44336';
      case 'ENGAGEMENT_OPPORTUNITY': return '#4CAF50';
      case 'SPENDING_PATTERN': return '#FF9800';
      case 'REWARD_PREFERENCE': return '#9C27B0';
      default: return '#757575';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 8 }}>
        <Box sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white', py: 3, px: 2 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>AI Insights</Typography>
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
          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
          color: 'white',
          py: 3,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                AI Insights
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Powered by OpenAI and BERT - Discover patterns and opportunities
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={loadInsights} sx={{ color: 'white' }}>
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
        {/* Metrics Overview */}
        {insightMetrics && (
          <Card elevation={4} sx={{ borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7B1FA2', mb: 3 }}>
                AI Performance Metrics
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7B1FA2', mb: 1 }}>
                    {insightMetrics.totalRecommendations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Recommendations
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#D32F2F', mb: 1 }}>
                    {insightMetrics.highPriorityActions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Priority Actions
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                    {insightMetrics.estimatedValue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Value (pts)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800', mb: 1 }}>
                    {(insightMetrics.accuracyScore * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI Accuracy Score
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Last updated: {insightMetrics.lastUpdated}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          AI-Powered Recommendations
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {recommendations.map((rec, index) => (
            <Box key={rec.id}>
              <Grow in timeout={200 * index}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    border: `2px solid ${rec.priority === 'HIGH' ? '#F44336' : rec.priority === 'MEDIUM' ? '#FF9800' : '#4CAF50'}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={rec.type.replace('_', ' ')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={rec.priority}
                        size="small"
                        color={getPriorityColor(rec.priority)}
                      />
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {rec.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Confidence: {(rec.confidence * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Value: {rec.estimatedValue} pts
                      </Typography>
                    </Box>
                    
                    {rec.actionRequired && (
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        sx={{
                          backgroundColor: '#9C27B0',
                          '&:hover': { backgroundColor: '#7B1FA2' },
                        }}
                      >
                        Take Action
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grow>
            </Box>
          ))}
        </Box>

        {/* Predictive Insights */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Predictive Insights
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {predictiveInsights.map((insight, index) => (
            <Box key={insight.id}>
              <Slide direction="up" in timeout={300 * index}>
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
                  onClick={() => handleInsightClick(insight)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: getInsightColor(insight.type),
                          color: 'white',
                          mr: 2,
                        }}
                      >
                        {getInsightIcon(insight.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {insight.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {insight.timeframe}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {insight.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Probability
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(insight.probability * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={insight.probability * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    
                    <Chip
                      label={insight.impact}
                      size="small"
                      color={insight.impact === 'HIGH' ? 'error' : insight.impact === 'MEDIUM' ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Slide>
            </Box>
          ))}
        </Box>

        {/* Behavior Patterns */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Behavior Analysis
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {behaviorPatterns.map((pattern, index) => (
            <Box key={pattern.category}>
              <Zoom in timeout={400 * index}>
                <Card elevation={2} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#7B1FA2' }}>
                      {pattern.category}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Frequency: {pattern.frequency} times per day
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Average Value: {pattern.averageValue} pts
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Trend: {pattern.trend}
                      </Typography>
                    </Box>
                    
                    {pattern.seasonality && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Peak Times:
                        </Typography>
                        {pattern.peakTimes.map((time, idx) => (
                          <Chip
                            key={idx}
                            label={time}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Recommendations:
                    </Typography>
                    <List dense>
                      {pattern.recommendations.map((rec, idx) => (
                        <ListItem key={idx} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon sx={{ color: '#4CAF50' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={rec}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          ))}
        </Box>

        {/* Sentiment Analysis Tool */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Sentiment Analysis Tool
        </Typography>
        
        <Card elevation={2} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Analyze the sentiment of any text using our AI-powered sentiment analysis
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter text to analyze sentiment..."
                value={sentimentText}
                onChange={(e) => setSentimentText(e.target.value)}
                variant="outlined"
              />
              <Button
                variant="contained"
                onClick={handleSentimentAnalysis}
                disabled={!sentimentText.trim() || isAnalyzingSentiment}
                sx={{
                  backgroundColor: '#9C27B0',
                  '&:hover': { backgroundColor: '#7B1FA2' },
                  minWidth: 120,
                }}
              >
                {isAnalyzingSentiment ? 'Analyzing...' : 'Analyze'}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Powered by OpenAI GPT-4 and BERT models for accurate sentiment analysis
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* Insight Detail Dialog */}
      <Dialog
        open={showInsightDialog}
        onClose={() => setShowInsightDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ backgroundColor: selectedInsight ? getInsightColor(selectedInsight.type) : '#757575' }}>
                {selectedInsight ? getInsightIcon(selectedInsight.type) : <InsightIcon />}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {selectedInsight?.title}
              </Typography>
            </Box>
            <IconButton onClick={() => setShowInsightDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedInsight && (
            <Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedInsight.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Key Metrics
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                        {(selectedInsight.probability * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Probability
                      </Typography>
                    </Paper>
                  </Box>
                  <Box>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                        {selectedInsight.timeframe}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Timeframe
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
              
              {selectedInsight.recommendedActions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Recommended Actions
                  </Typography>
                  <List>
                    {selectedInsight.recommendedActions.map((action, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <CheckIcon sx={{ color: '#4CAF50' }} />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setShowInsightDialog(false)} variant="outlined">
            Close
          </Button>
          {selectedInsight?.actionable && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#9C27B0',
                '&:hover': { backgroundColor: '#7B1FA2' },
              }}
            >
              Take Action
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Sentiment Analysis Result Dialog */}
      <Dialog
        open={showSentimentDialog}
        onClose={() => setShowSentimentDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BrainIcon sx={{ color: '#9C27B0' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Sentiment Analysis Result
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {sentimentResult && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {sentimentResult.sentiment.charAt(0).toUpperCase() + sentimentResult.sentiment.slice(1)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Confidence: {(sentimentResult.confidence * 100).toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.abs(sentimentResult.score) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Analysis Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Score:</strong> {sentimentResult.score.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Emotional Tone:</strong> {sentimentResult.emotionalTone}
                </Typography>
              </Box>
              
              {sentimentResult.positiveWords.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Positive Words:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {sentimentResult.positiveWords.map((word, index) => (
                      <Chip key={index} label={word} size="small" color="success" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {sentimentResult.negativeWords.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Negative Words:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {sentimentResult.negativeWords.map((word, index) => (
                      <Chip key={index} label={word} size="small" color="error" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {sentimentResult.suggestions.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Suggestions:
                  </Typography>
                  <List dense>
                    {sentimentResult.suggestions.map((suggestion, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <InfoIcon sx={{ fontSize: 16, color: '#2196F3' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={suggestion}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setShowSentimentDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InsightsScreen;
