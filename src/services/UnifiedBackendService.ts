import axios from 'axios';
import SupabaseService from './SupabaseService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyPoints {
  id: string;
  userId: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'EARN' | 'REDEEM';
  points: number;
  reason: string;
  timestamp: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: User;
  message: string;
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  positiveWords: number;
  negativeWords: number;
}

export interface AddPointsResult {
  success: boolean;
  newBalance?: number;
  message: string;
}

class UnifiedBackendService {
  private static instance: UnifiedBackendService;
  
  // Backend service URLs
  private readonly JAVA_BACKEND_URL = process.env.REACT_APP_JAVA_BACKEND_URL || 'http://localhost:8080';
  private readonly PYTHON_AI_URL = process.env.REACT_APP_PYTHON_AI_URL || 'http://localhost:8000';
  
  // Axios instances with default configs
  private javaBackendApi = axios.create({
    baseURL: this.JAVA_BACKEND_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private pythonAiApi = axios.create({
    baseURL: this.PYTHON_AI_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {
    // Add request interceptor to include auth token
    this.javaBackendApi.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): UnifiedBackendService {
    if (!UnifiedBackendService.instance) {
      UnifiedBackendService.instance = new UnifiedBackendService();
    }
    return UnifiedBackendService.instance;
  }

  public async initialize(): Promise<void> {
    console.log('🔧 Initializing UnifiedBackendService...');
    console.log(`🌐 Java Backend URL: ${this.JAVA_BACKEND_URL}`);
    console.log(`🤖 Python AI Service URL: ${this.PYTHON_AI_URL}`);
    
    try {
      // Test backend connectivity
      await this.testBackendConnectivity();
      console.log('✅ UnifiedBackendService initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing UnifiedBackendService:', error);
      throw error;
    }
  }

  private async testBackendConnectivity(): Promise<void> {
    try {
      // Test Java backend - use public health endpoint
      try {
        const javaResponse = await this.javaBackendApi.get('/api/public/health');
        console.log('✅ Java backend is accessible:', javaResponse.status);
      } catch (javaError: any) {
        console.warn('⚠️ Java backend connectivity issue:', javaError.message);
      }
      
      // Test Python AI service
      try {
        const pythonResponse = await this.pythonAiApi.get('/health');
        console.log('✅ Python AI service is accessible:', pythonResponse.status);
      } catch (pythonError: any) {
        console.warn('⚠️ Python AI service connectivity issue:', pythonError.message);
      }
      
    } catch (error) {
      console.warn('⚠️ Some backend services may not be accessible:', error);
      // Don't throw error, just log warning - app can still work with fallbacks
    }
  }

  public async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('🔐 Attempting login for:', email);
      
      // Try Supabase first
      const supabaseService = SupabaseService.getInstance();
      const supabaseResult = await supabaseService.signIn(email, password);
      
      if (supabaseResult.success && supabaseResult.user) {
        console.log('✅ Login successful via Supabase');
        
        // Store user data
        localStorage.setItem('user_id', supabaseResult.user.id);
        localStorage.setItem('user_data', JSON.stringify(supabaseResult.user));
        
        return {
          success: true,
          user: supabaseResult.user,
          message: supabaseResult.message,
        };
      }
      
      // Fallback to Java backend
      console.log('🔄 Supabase login failed, trying Java backend...');
      
      const response = await this.javaBackendApi.post('/api/auth/login', {
        email: email,
        password: password,
      });

      if (response.data && response.data.token) {
        console.log('✅ Login successful via Java backend');
        
        // Store token and user data
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_id', response.data.user.id);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          message: 'Login successful'
        };
      }
      
      // If we reach here, something went wrong
      return {
        success: false,
        message: 'Login failed - no response from backend'
      };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }



  private generateToken(userId: string): string {
    const payload = {
      userId,
      timestamp: Date.now(),
    };
    return btoa(JSON.stringify(payload));
  }

  public getCurrentUser(): User | null {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) return null;
    
    // Check if we have stored user data
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      try {
        return JSON.parse(storedUserData);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }
    
    return null;
  }

  public getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  public logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
  }

  public async signup(email: string, password: string, firstName: string, lastName: string, phoneNumber?: string): Promise<LoginResult> {
    try {
      console.log('📝 Attempting signup for:', email);
      
      const supabaseService = SupabaseService.getInstance();
      const supabaseResult = await supabaseService.signUp(email, password, firstName, lastName, phoneNumber);
      
      if (supabaseResult.success && supabaseResult.user) {
        console.log('✅ Signup successful via Supabase');
        
        // Store user data
        localStorage.setItem('user_id', supabaseResult.user.id);
        localStorage.setItem('user_data', JSON.stringify(supabaseResult.user));
        
        return {
          success: true,
          user: supabaseResult.user,
          message: supabaseResult.message,
        };
      }
      
      return {
        success: false,
        message: supabaseResult.message,
      };
    } catch (error) {
      console.error('❌ Signup error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during signup',
      };
    }
  }

  public async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      console.log('🤖 Analyzing sentiment via Python AI service:', text);
      
      const response = await this.pythonAiApi.post('/analyze-sentiment', {
        text: text
      });
      
      if (response.data) {
        console.log('✅ Sentiment analysis from Python AI service:', response.data);
        return response.data;
      }
      
      throw new Error('No sentiment analysis data received from AI service');
    } catch (error) {
      console.error('❌ Sentiment analysis error:', error);
      throw error;
    }
  }



  public async getLoyaltyPoints(userId: string): Promise<LoyaltyPoints | undefined> {
    if (userId === 'guest') {
      return {
        id: 'guest-points',
        userId: 'guest',
        pointsBalance: 1500,
        totalEarned: 2000,
        totalRedeemed: 500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    try {
      // Try Supabase first
      const supabaseService = SupabaseService.getInstance();
      const supabaseResult = await supabaseService.getLoyaltyPoints(userId);
      
      if (supabaseResult.success && supabaseResult.points) {
        console.log('✅ Loyalty points from Supabase:', supabaseResult.points);
        return supabaseResult.points;
      }
      
      // Fallback to Java backend
      console.log('🔄 Supabase points failed, trying Java backend...');
      const response = await this.javaBackendApi.get(`/api/loyalty-points/${userId}`);
      if (response.data) {
        console.log('✅ Loyalty points from Java backend:', response.data);
        return response.data;
      }
      return undefined;
    } catch (error) {
      console.error('❌ Error getting loyalty points:', error);
      throw error;
    }
  }

  public async addLoyaltyPoints(userId: string, points: number, reason: string): Promise<AddPointsResult> {
    try {
      // Try Supabase first
      const supabaseService = SupabaseService.getInstance();
      const supabaseResult = await supabaseService.addPoints(userId, points, reason);
      
      if (supabaseResult.success && supabaseResult.points) {
        console.log('✅ Points added via Supabase:', supabaseResult.points);
        return {
          success: true,
          newBalance: supabaseResult.points.pointsBalance,
          message: supabaseResult.message,
        };
      }
      
      // Fallback to Java backend
      console.log('🔄 Supabase add points failed, trying Java backend...');
      const response = await this.javaBackendApi.post('/api/loyalty-points/add', {
        userId: userId,
        points: points,
        reason: reason
      });
      
      if (response.data && response.data.success) {
        console.log('✅ Points added via Java backend:', response.data);
        return response.data;
      }
      
      throw new Error('Failed to add points - invalid response from backend');
    } catch (error) {
      console.error('❌ Error adding loyalty points:', error);
      throw error;
    }
  }

  public async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const response = await this.javaBackendApi.get(`/api/transactions/${userId}`);
      if (response.data) {
        console.log('✅ Transactions from Java backend:', response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting transactions:', error);
      throw error;
    }
  }

  public async resetData(): Promise<void> {
    console.log('🔄 Resetting all data...');
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    
    console.log('✅ Data reset complete');
  }

  // ==================== ADMIN METHODS ====================
  
  public async getAdminOverview(): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return {
        totalUsers: 100,
        activeUsers: 50,
        totalPointsIssued: 10000,
        totalPointsRedeemed: 2000,
        activePoints: 8000,
        totalPartners: 10,
        activePartners: 8,
        totalQuizzes: 5,
        activeQuizzes: 3,
        totalPromotions: 12,
        activePromotions: 7
      };
    }
    try {
      const response = await this.javaBackendApi.get('/api/admin/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        activePoints: 0,
        totalPartners: 0,
        activePartners: 0,
        totalQuizzes: 0,
        activeQuizzes: 0,
        totalPromotions: 0,
        activePromotions: 0
      };
    }
  }
  
  public async getAdminUsers(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      return [
        { id: 'gu1', email: 'guest1@example.com', firstName: 'Guest', lastName: 'One', role: 'USER', isActive: true, createdAt: new Date().toISOString() },
        { id: 'gu2', email: 'guest2@example.com', firstName: 'Guest', lastName: 'Two', role: 'USER', isActive: true, createdAt: new Date().toISOString() },
      ];
    }
    try {
      const response = await this.javaBackendApi.get('/api/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  }
  
  public async getAdminPartners(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      return [
        { id: 'gp1', name: 'Guest Partner 1', type: 'RESTAURANT', status: 'ACTIVE' },
        { id: 'gp2', name: 'Guest Partner 2', type: 'RETAIL', status: 'ACTIVE' },
      ];
    }
    try {
      const response = await this.javaBackendApi.get('/api/admin/partners');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin partners:', error);
      return [];
    }
  }
  
  public async getAdminQuizzes(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      return [
        { id: 'gq1', title: 'Guest Quiz 1', category: 'General', difficultyLevel: 'easy' },
        { id: 'gq2', title: 'Guest Quiz 2', category: 'Science', difficultyLevel: 'medium' },
      ];
    }
    try {
      const response = await this.javaBackendApi.get('/api/admin/quizzes');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin quizzes:', error);
      return [];
    }
  }
  
  public async getAdminPromotions(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      return [
        { id: 'gpr1', name: 'Guest Promo 1', type: 'DISCOUNT', status: 'ACTIVE' },
        { id: 'gpr2', name: 'Guest Promo 2', type: 'BONUS_POINTS', status: 'ACTIVE' },
      ];
    }
    try {
      const response = await this.javaBackendApi.get('/api/admin/promotions');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin promotions:', error);
      return [];
    }
  }
  
  public async regenerateQuizQuestions(quizId: string): Promise<void> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Regenerate quiz questions simulated.');
      return;
    }
    try {
      await this.javaBackendApi.post(`/api/admin/quizzes/${quizId}/regenerate`);
    } catch (error) {
      console.error('Error regenerating quiz questions:', error);
      throw error;
    }
  }

  // ==================== ADMIN CRUD METHODS ====================
  
  public async createUser(userData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Create user simulated.');
      return { id: 'new-guest-user', ...userData };
    }
    try {
      const response = await this.javaBackendApi.post('/api/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  public async updateUser(userId: string, userData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Update user simulated.');
      return { id: userId, ...userData };
    }
    try {
      const response = await this.javaBackendApi.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  public async deleteUser(userId: string): Promise<void> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Delete user simulated.');
      return;
    }
    try {
      await this.javaBackendApi.delete(`/api/admin/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  public async createPartner(partnerData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Create partner simulated.');
      return { id: 'new-guest-partner', ...partnerData };
    }
    try {
      const response = await this.javaBackendApi.post('/api/admin/partners', partnerData);
      return response.data;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  }

  public async updatePartner(partnerId: string, partnerData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Update partner simulated.');
      return { id: partnerId, ...partnerData };
    }
    try {
      const response = await this.javaBackendApi.put(`/api/admin/partners/${partnerId}`, partnerData);
      return response.data;
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  }

  public async deletePartner(partnerId: string): Promise<void> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Delete partner simulated.');
      return;
    }
    try {
      await this.javaBackendApi.delete(`/api/admin/partners/${partnerId}`);
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  }

  public async createQuiz(quizData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Create quiz simulated.');
      return { id: 'new-guest-quiz', ...quizData };
    }
    try {
      const response = await this.javaBackendApi.post('/api/admin/quizzes', quizData);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  public async updateQuiz(quizId: string, quizData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Update quiz simulated.');
      return { id: quizId, ...quizData };
    }
    try {
      const response = await this.javaBackendApi.put(`/api/admin/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }

  public async deleteQuiz(quizId: string): Promise<void> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Delete quiz simulated.');
      return;
    }
    try {
      await this.javaBackendApi.delete(`/api/admin/quizzes/${quizId}`);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  public async createPromotion(promotionData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Create promotion simulated.');
      return { id: 'new-guest-promotion', ...promotionData };
    }
    try {
      const response = await this.javaBackendApi.post('/api/admin/promotions', promotionData);
      return response.data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  public async updatePromotion(promotionId: string, promotionData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Update promotion simulated.');
      return { id: promotionId, ...promotionData };
    }
    try {
      const response = await this.javaBackendApi.put(`/api/admin/promotions/${promotionId}`, promotionData);
      return response.data;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }

  public async deletePromotion(promotionId: string): Promise<void> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Delete promotion simulated.');
      return;
    }
    try {
      await this.javaBackendApi.delete(`/api/admin/promotions/${promotionId}`);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }

  // ==================== QUIZ METHODS ====================
  
  public async generateQuizQuestions(category: string, difficulty: string, questionCount: number, partnerContext?: string): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Generate quiz questions simulated.');
      return [
        {
          id: 'gq1',
          questionText: 'Guest Question 1',
          questionType: 'MULTIPLE_CHOICE',
          options: 'Option A|Option B|Option C',
          correctAnswer: 'Option A',
          explanation: 'This is a dummy explanation.',
          difficulty: 'easy',
          points: 10,
        },
        {
          id: 'gq2',
          questionText: 'Guest Question 2',
          questionType: 'TRUE_FALSE',
          options: 'True|False',
          correctAnswer: 'True',
          explanation: 'Another dummy explanation.',
          difficulty: 'medium',
          points: 20,
        },
      ];
    }
    try {
      const response = await this.javaBackendApi.post('/api/quiz/generate', {
        category,
        difficulty,
        questionCount,
        partnerContext,
        userId: this.getCurrentUserId()
      });
      return response.data.questions || [];
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw new Error('Failed to generate quiz questions. Please try again.');
    }
  }

  public async submitQuizAnswers(questions: any[], answers: number[], timeTaken: number, category: string, difficulty: string): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      console.log('Guest: Submit quiz answers simulated.');
      return { success: true, score: 80, pointsEarned: 50 };
    }
    try {
      const response = await this.javaBackendApi.post('/api/quiz/submit', {
        userId: this.getCurrentUserId(),
        questions,
        answers,
        timeTaken,
        category,
        difficulty
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz answers:', error);
      throw error;
    }
  }

  public async getQuizCategories(): Promise<string[]> {
    if (this.getCurrentUserId() === 'guest') {
      return ['General', 'Science', 'History', 'Technology'];
    }
    try {
      const response = await this.javaBackendApi.get('/api/quiz/categories');
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching quiz categories:', error);
      return [];
    }
  }

  public async getQuizDifficultyLevels(): Promise<string[]> {
    if (this.getCurrentUserId() === 'guest') {
      return ['easy', 'medium', 'hard'];
    }
    try {
      const response = await this.javaBackendApi.get('/api/quiz/difficulty-levels');
      return response.data.difficultyLevels || [];
    } catch (error) {
      console.error('Error fetching quiz difficulty levels:', error);
      return [];
    }
  }
  
  public async getQuizById(quizId: string): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return {
        id: quizId,
        title: 'Guest Quiz Title',
        description: 'This is a dummy quiz for guest users.',
        category: 'General',
        difficultyLevel: 'easy',
        pointsReward: 100,
        timeLimitMinutes: 5,
      };
    }
    try {
      const response = await this.javaBackendApi.get(`/api/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }
  
  public async getQuizQuestions(quizId: string): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      const dummyQuestions = [
        {
          id: 'q1',
          questionText: 'What is the capital of France?',
          questionType: 'MULTIPLE_CHOICE',
          options: 'Paris|London|Berlin|Madrid',
          correctAnswer: 'Paris',
          explanation: 'Paris is the capital and most populous city of France.',
          difficulty: 'easy',
          points: 10,
        },
        {
          id: 'q2',
          questionText: 'Which planet is known as the Red Planet?',
          questionType: 'MULTIPLE_CHOICE',
          options: 'Earth|Mars|Jupiter|Venus',
          correctAnswer: 'Mars',
          explanation: 'Mars is often referred to as the Red Planet due to its reddish appearance.',
          difficulty: 'medium',
          points: 20,
        },
        {
          id: 'q3',
          questionText: 'What is the largest ocean on Earth?',
          questionType: 'MULTIPLE_CHOICE',
          options: 'Atlantic|Indian|Arctic|Pacific',
          correctAnswer: 'Pacific',
          explanation: 'The Pacific Ocean is the largest and deepest of Earth\'s five oceanic divisions.',
          difficulty: 'hard',
          points: 30,
        },
      ];
      return dummyQuestions;
    }
    try {
      const response = await this.javaBackendApi.get(`/api/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      return [];
    }
  }
  

  
  // ==================== LOCATION & PARTNER METHODS ====================
  
  public async getNearbyPartners(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      const dummyPartners = [
        {
          id: 'p1',
          name: 'Guest Restaurant',
          type: 'RESTAURANT',
          location: 'Guest City',
          status: 'ACTIVE',
          commission: 0.1,
          rating: 4.5,
          contactEmail: 'guest@example.com',
          contactPhone: '123-456-7890',
          businessHours: '9 AM - 10 PM',
          latitude: -17.8252,
          longitude: 31.0335,
          distance: 1.2,
          currentPromotions: [{ title: 'Guest Discount' }],
        },
        {
          id: 'p2',
          name: 'Guest Shop',
          type: 'RETAIL',
          location: 'Guest City',
          status: 'ACTIVE',
          commission: 0.05,
          rating: 4.0,
          contactEmail: 'guest2@example.com',
          contactPhone: '098-765-4321',
          businessHours: '10 AM - 8 PM',
          latitude: -17.8300,
          longitude: 31.0400,
          distance: 2.5,
          currentPromotions: [{ title: 'Guest Offer' }],
        },
      ];
      return dummyPartners;
    }
    try {
      const response = await this.javaBackendApi.get('/api/partners/nearby');
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby partners:', error);
      return [];
    }
  }
  
  public async checkInToLocation(partnerId: string): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return { success: true, message: 'Guest check-in simulated.' };
    }
    try {
      const response = await this.javaBackendApi.post(`/api/location/checkin/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking in to location:', error);
      throw error;
    }
  }

  public async verifyLocation(latitude: number, longitude: number, partnerId: string, verificationMethod: string): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return { success: true, message: 'Guest location verification simulated.' };
    }
    try {
      const response = await this.javaBackendApi.post('/api/quiz/location/verify', {
        userId: this.getCurrentUserId(),
        latitude,
        longitude,
        partnerId,
        verificationMethod,
        deviceInfo: navigator.userAgent,
        timestamp: Date.now()
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying location:', error);
      throw error;
    }
  }

  // ==================== AD WATCHING METHODS ====================
  
  public async watchAd(adId: string, adTitle: string): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return { success: true, message: 'Guest ad watch simulated.' };
    }
    try {
      const response = await this.javaBackendApi.post('/api/quiz/ads/watch', {
        userId: this.getCurrentUserId(),
        adId,
        adTitle
      });
      return response.data;
    } catch (error) {
      console.error('Error watching ad:', error);
      throw error;
    }
  }

  public async getAdProgress(): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return { watchedAds: 5, totalAds: 10, progress: 0.5 };
    }
    try {
      const userId = this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');
      
      const response = await this.javaBackendApi.get(`/api/quiz/ads/progress/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ad progress:', error);
      throw error;
    }
  }

  public async getAvailableAds(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      const dummyAds = [
        { id: 'ad1', title: 'Guest Ad 1', description: 'Watch this ad for points!' },
        { id: 'ad2', title: 'Guest Ad 2', description: 'Another exciting ad!' },
      ];
      return dummyAds;
    }
    try {
      const response = await this.javaBackendApi.get('/api/quiz/ads/available');
      return response.data.ads || [];
    } catch (error) {
      console.error('Error fetching available ads:', error);
      throw error;
    }
  }
  
  public async getPartnerDetails(partnerId: string): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return {
        id: partnerId,
        name: 'Guest Partner',
        type: 'GENERIC',
        location: 'Guest Location',
        status: 'ACTIVE',
        commission: 0,
        rating: 0,
        contactEmail: '',
        contactPhone: '',
        businessHours: '',
        latitude: 0,
        longitude: 0,
        distance: 0,
        currentPromotions: [],
      };
    }
    try {
      const response = await this.javaBackendApi.get(`/api/partners/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner details:', error);
      throw error;
    }
  }
  
  // ==================== PAYMENT & SUBSCRIPTION METHODS ====================
  
  public async getPaymentMethods(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      return [
        {
          id: 'pm1',
          type: 'CREDIT_CARD',
          last4: '1111',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'pm2',
          type: 'MOBILE_MONEY',
          last4: '5555',
          brand: 'EcoCash',
          isDefault: false,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    try {
      const response = await this.javaBackendApi.get('/api/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }
  
  public async addPaymentMethod(paymentData: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return { success: true, message: 'Guest add payment method simulated.' };
    }
    try {
      const response = await this.javaBackendApi.post('/api/payments/methods', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
  
  public async getSubscriptionPlans(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      return [
        {
          id: 'plan1',
          name: 'Basic Plan',
          description: 'Access to core features',
          price: 9.99,
          currency: 'USD',
          interval: 'MONTHLY',
          features: ['Feature A', 'Feature B'],
          isPopular: false,
          isActive: true,
        },
        {
          id: 'plan2',
          name: 'Premium Plan',
          description: 'Unlock all features',
          price: 19.99,
          currency: 'USD',
          interval: 'MONTHLY',
          features: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
          isPopular: true,
          isActive: true,
        },
      ];
    }
    try {
      const response = await this.javaBackendApi.get('/api/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }
  
  public async subscribeToPlan(planId: string, paymentMethodId: string): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return { success: true, message: 'Guest subscription simulated.' };
    }
    try {
      const response = await this.javaBackendApi.post('/api/subscriptions/subscribe', {
        planId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  }
  
  // ==================== QR CODE METHODS ====================
  
  public async generateQRCode(data: any): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return { success: true, message: 'Guest QR code generation simulated.' };
    }
    try {
      const response = await this.javaBackendApi.post('/api/qr/generate', data);
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
  
  public async scanQRCode(qrData: string): Promise<any> {
    if (this.getCurrentUserId() === 'guest') {
      return { success: true, message: 'Guest QR code scan simulated.', pointsEarned: 25 };
    }
    try {
      const response = await this.javaBackendApi.post('/api/qr/scan', { qrData });
      return response.data;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      throw error;
    }
  }
  
  public async getQRCodeHistory(): Promise<any[]> {
    if (this.getCurrentUserId() === 'guest') {
      return [
        {
          id: 'qr1',
          type: 'POINTS',
          data: 'guest-points-qr',
          pointsAmount: 50,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(), // Expires in 1 hour
          createdAt: new Date().toISOString(),
          description: 'Guest points QR code',
        },
        {
          id: 'qr2',
          type: 'CHECKIN',
          data: 'guest-checkin-qr',
          status: 'USED',
          usedAt: new Date().toISOString(),
          usedBy: 'guest',
          createdAt: new Date(Date.now() - 86400 * 1000).toISOString(), // Created yesterday
          description: 'Guest check-in QR code',
        },
      ];
    }
    try {
      const response = await this.javaBackendApi.get('/api/qr/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching QR code history:', error);
      return [];
    }
  }
}

export default UnifiedBackendService;
