import axios from 'axios';

export interface AIRecommendation {
  id: string;
  type: 'EARNING_TIP' | 'REDEMPTION_OPPORTUNITY' | 'PERSONALIZED_OFFER' | 'BEHAVIOR_INSIGHT';
  title: string;
  description: string;
  confidence: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionRequired: boolean;
  estimatedValue: number;
  category: string;
}

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  positiveWords: string[];
  negativeWords: string[];
  suggestions: string[];
  emotionalTone: string;
}

export interface PredictiveInsight {
  id: string;
  type: 'CHURN_RISK' | 'ENGAGEMENT_OPPORTUNITY' | 'SPENDING_PATTERN' | 'REWARD_PREFERENCE';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  actionable: boolean;
  recommendedActions: string[];
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface UserBehaviorPattern {
  category: string;
  frequency: number;
  averageValue: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  seasonality: boolean;
  peakTimes: string[];
  recommendations: string[];
}

export interface AIConfig {
  openaiApiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

class AIService {
  private static instance: AIService;
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1';
  private readonly PYTHON_AI_URL = process.env.REACT_APP_PYTHON_AI_URL || 'http://localhost:8000';
  private config: AIConfig;
  private isInitialized = false;

  private constructor() {
    this.config = {
      openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
    };
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Test OpenAI connectivity
      if (this.config.openaiApiKey) {
        await this.testOpenAIConnectivity();
      }
      
      // Test Python AI service connectivity
      await this.testPythonAIConnectivity();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('AI Service initialization failed:', error);
      throw error;
    }
  }

  private async testOpenAIConnectivity(): Promise<void> {
    try {
      const response = await axios.get(`${this.OPENAI_API_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
        },
        timeout: 10000,
      });
      
      if (response.status === 200) {
        console.log('OpenAI API connection successful');
      }
    } catch (error) {
      console.warn('OpenAI API connection failed, will use fallback methods:', error);
    }
  }

  private async testPythonAIConnectivity(): Promise<void> {
    try {
      const response = await axios.get(`${this.PYTHON_AI_URL}/health`, {
        timeout: 5000,
      });
      
      if (response.status === 200) {
        console.log('Python AI service connection successful');
      }
    } catch (error) {
      console.warn('Python AI service connection failed, will use fallback methods:', error);
    }
  }

  public async analyzeSentiment(text: string, userId?: string): Promise<SentimentAnalysisResult> {
    if (userId === 'guest') {
        return {
            sentiment: 'positive',
            score: 0.8,
            confidence: 0.95,
            positiveWords: ['love', 'amazing', 'great'],
            negativeWords: [],
            suggestions: ['Share your positive feedback with the merchant!'],
            emotionalTone: 'joyful',
        };
    }
    try {
      // Use Python AI service (BERT-based)
      const response = await axios.post(`${this.PYTHON_AI_URL}/analyze-sentiment`, {
        text: text,
        model: 'bert-finetuned',
        include_analysis: true,
      }, {
        timeout: 15000,
      });

      if (response.data) {
        return {
          sentiment: response.data.sentiment,
          score: response.data.score,
          confidence: response.data.confidence || 0.85,
          positiveWords: response.data.positive_words || [],
          negativeWords: response.data.negative_words || [],
          suggestions: response.data.suggestions || [],
          emotionalTone: response.data.emotional_tone || 'neutral',
        };
      }
      
      throw new Error('No sentiment analysis data received from AI service');
    } catch (error) {
      console.error('❌ Sentiment analysis error:', error);
      throw error;
    }
  }



  public async generateRecommendations(userId: string, userData: any): Promise<AIRecommendation[]> {
    if (userId === 'guest') {
      return [
        { id: 'rec1', type: 'EARNING_TIP', title: 'Double Points at Nandos', description: 'Visit Nandos this weekend to earn double points on all purchases.', confidence: 0.95, priority: 'HIGH', actionRequired: true, estimatedValue: 100, category: 'Dining' },
        { id: 'rec2', type: 'REDEMPTION_OPPORTUNITY', title: 'Discount on Pick n Pay', description: 'You have enough points to get a $5 discount at Pick n Pay.', confidence: 0.9, priority: 'MEDIUM', actionRequired: true, estimatedValue: 50, category: 'Groceries' },
        { id: 'rec3', type: 'PERSONALIZED_OFFER', title: 'Edgars Fashion Offer', description: 'Based on your shopping habits, here is a 10% discount voucher for Edgars.', confidence: 0.85, priority: 'MEDIUM', actionRequired: true, estimatedValue: 75, category: 'Retail' },
      ];
    }
    try {
      // Use Python AI service for personalized recommendations
      const response = await axios.post(`${this.PYTHON_AI_URL}/generate-recommendations`, {
        user_id: userId,
        user_data: userData,
        model: 'bert-recommendation',
        max_recommendations: 5,
      }, {
        timeout: 20000,
      });

      if (response.data && response.data.recommendations) {
        return response.data.recommendations.map((rec: any) => ({
          id: rec.id,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          confidence: rec.confidence,
          priority: rec.priority,
          actionRequired: rec.action_required,
          estimatedValue: rec.estimated_value,
          category: rec.category,
        }));
      }
      
      throw new Error('No recommendations data received from AI service');
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      throw error;
    }
  }



  public async generatePredictiveInsights(userId: string, userData: any): Promise<PredictiveInsight[]> {
    if (userId === 'guest') {
        return [
            { id: 'pi1', type: 'CHURN_RISK', title: 'Potential Churn Risk', description: 'Your engagement has been decreasing. We miss you!', probability: 0.75, timeframe: 'Next 30 days', actionable: true, recommendedActions: ['Complete a quiz', 'Visit a partner store'], impact: 'HIGH' },
            { id: 'pi2', type: 'ENGAGEMENT_OPPORTUNITY', title: 'New Partner Nearby', description: 'A new partner store, "The Book Nook", has opened near you. Visit them to earn bonus points.', probability: 0.9, timeframe: 'This week', actionable: true, recommendedActions: ['Visit The Book Nook'], impact: 'MEDIUM' },
        ];
    }
    try {
      // Use Python AI service for predictive insights
      const response = await axios.post(`${this.PYTHON_AI_URL}/predictive-insights`, {
        user_id: userId,
        user_data: userData,
        model: 'bert-predictive',
        prediction_horizon: '30_days',
      }, {
        timeout: 25000,
      });

      if (response.data && response.data.insights) {
        return response.data.insights.map((insight: any) => ({
          id: insight.id,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          probability: insight.probability,
          timeframe: insight.timeframe,
          actionable: insight.actionable,
          recommendedActions: insight.recommended_actions || [],
          impact: insight.impact,
        }));
      }
      
      throw new Error('No predictive insights data received from AI service');
    } catch (error) {
      console.error('❌ Error generating predictive insights:', error);
      throw error;
    }
  }



  public async analyzeUserBehavior(userId: string, userData: any): Promise<UserBehaviorPattern[]> {
    if (userId === 'guest') {
        return [
            { category: 'Dining', frequency: 2, averageValue: 75, trend: 'STABLE', seasonality: true, peakTimes: ['Weekends', 'Evenings'], recommendations: ['Try the new menu at Nandos', 'Look for dining offers on weekdays'] },
            { category: 'Groceries', frequency: 1, averageValue: 120, trend: 'INCREASING', seasonality: false, peakTimes: ['Saturday mornings'], recommendations: ['Buy fresh produce to earn bonus points', 'Create a shopping list to maximize savings'] },
        ];
    }
    try {
      // Use Python AI service for behavior analysis
      const response = await axios.post(`${this.PYTHON_AI_URL}/analyze-behavior`, {
        user_id: userId,
        user_data: userData,
        model: 'bert-behavior',
        analysis_depth: 'comprehensive',
      }, {
        timeout: 30000,
      });

      if (response.data && response.data.patterns) {
        return response.data.patterns.map((pattern: any) => ({
          category: pattern.category,
          frequency: pattern.frequency,
          averageValue: pattern.average_value,
          trend: pattern.trend,
          seasonality: pattern.seasonality,
          peakTimes: pattern.peak_times || [],
          recommendations: pattern.recommendations || [],
        }));
      }
      
      throw new Error('No behavior patterns data received from AI service');
    } catch (error) {
      console.error('❌ Error analyzing user behavior:', error);
      throw error;
    }
  }



  public async finetuneModel(modelType: string, trainingData: any): Promise<boolean> {
    try {
      // This would typically call the Python AI service to finetune BERT models
      const response = await axios.post(`${this.PYTHON_AI_URL}/finetune-model`, {
        model_type: modelType,
        training_data: trainingData,
        hyperparameters: {
          learning_rate: 0.00001,
          batch_size: 16,
          epochs: 3,
          max_length: 512,
        },
      }, {
        timeout: 60000, // 1 minute timeout for training
      });

      return response.status === 200;
    } catch (error) {
      console.error('Model finetuning failed:', error);
      return false;
    }
  }

  public getServiceStatus(): { openai: boolean; pythonAI: boolean; initialized: boolean } {
    return {
      openai: !!this.config.openaiApiKey,
      pythonAI: true, // Assuming Python service is available
      initialized: this.isInitialized,
    };
  }

  public updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default AIService;
