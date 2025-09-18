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
    try {
      const response = await this.javaBackendApi.get('/api/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  }
  
  public async getAdminPartners(): Promise<any[]> {
    try {
      const response = await this.javaBackendApi.get('/api/admin/partners');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin partners:', error);
      return [];
    }
  }
  
  public async getAdminQuizzes(): Promise<any[]> {
    try {
      const response = await this.javaBackendApi.get('/api/admin/quizzes');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin quizzes:', error);
      return [];
    }
  }
  
  public async getAdminPromotions(): Promise<any[]> {
    try {
      const response = await this.javaBackendApi.get('/api/admin/promotions');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin promotions:', error);
      return [];
    }
  }
  
  public async regenerateQuizQuestions(quizId: string): Promise<void> {
    try {
      await this.javaBackendApi.post(`/api/admin/quizzes/${quizId}/regenerate`);
    } catch (error) {
      console.error('Error regenerating quiz questions:', error);
      throw error;
    }
  }

  // ==================== ADMIN CRUD METHODS ====================
  
  public async createUser(userData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.post('/api/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  public async updateUser(userId: string, userData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  public async deleteUser(userId: string): Promise<void> {
    try {
      await this.javaBackendApi.delete(`/api/admin/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  public async createPartner(partnerData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.post('/api/admin/partners', partnerData);
      return response.data;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  }

  public async updatePartner(partnerId: string, partnerData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.put(`/api/admin/partners/${partnerId}`, partnerData);
      return response.data;
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  }

  public async deletePartner(partnerId: string): Promise<void> {
    try {
      await this.javaBackendApi.delete(`/api/admin/partners/${partnerId}`);
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  }

  public async createQuiz(quizData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.post('/api/admin/quizzes', quizData);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  public async updateQuiz(quizId: string, quizData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.put(`/api/admin/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }

  public async deleteQuiz(quizId: string): Promise<void> {
    try {
      await this.javaBackendApi.delete(`/api/admin/quizzes/${quizId}`);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  public async createPromotion(promotionData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.post('/api/admin/promotions', promotionData);
      return response.data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  public async updatePromotion(promotionId: string, promotionData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.put(`/api/admin/promotions/${promotionId}`, promotionData);
      return response.data;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }

  public async deletePromotion(promotionId: string): Promise<void> {
    try {
      await this.javaBackendApi.delete(`/api/admin/promotions/${promotionId}`);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }

  // ==================== QUIZ METHODS ====================
  
  public async generateQuizQuestions(category: string, difficulty: string, questionCount: number, partnerContext?: string): Promise<any[]> {
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
    try {
      const response = await this.javaBackendApi.get('/api/quiz/categories');
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching quiz categories:', error);
      return [];
    }
  }

  public async getQuizDifficultyLevels(): Promise<string[]> {
    try {
      const response = await this.javaBackendApi.get('/api/quiz/difficulty-levels');
      return response.data.difficultyLevels || [];
    } catch (error) {
      console.error('Error fetching quiz difficulty levels:', error);
      return [];
    }
  }
  
  public async getQuizById(quizId: string): Promise<any> {
    try {
      const response = await this.javaBackendApi.get(`/api/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }
  
  public async getQuizQuestions(quizId: string): Promise<any[]> {
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
    try {
      const response = await this.javaBackendApi.get('/api/partners/nearby');
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby partners:', error);
      return [];
    }
  }
  
  public async checkInToLocation(partnerId: string): Promise<any> {
    try {
      const response = await this.javaBackendApi.post(`/api/location/checkin/${partnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking in to location:', error);
      throw error;
    }
  }

  public async verifyLocation(latitude: number, longitude: number, partnerId: string, verificationMethod: string): Promise<any> {
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
    try {
      const response = await this.javaBackendApi.get('/api/quiz/ads/available');
      return response.data.ads || [];
    } catch (error) {
      console.error('Error fetching available ads:', error);
      throw error;
    }
  }
  
  public async getPartnerDetails(partnerId: string): Promise<any> {
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
    try {
      const response = await this.javaBackendApi.get('/api/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }
  
  public async addPaymentMethod(paymentData: any): Promise<any> {
    try {
      const response = await this.javaBackendApi.post('/api/payments/methods', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
  
  public async getSubscriptionPlans(): Promise<any[]> {
    try {
      const response = await this.javaBackendApi.get('/api/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }
  
  public async subscribeToPlan(planId: string, paymentMethodId: string): Promise<any> {
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
    try {
      const response = await this.javaBackendApi.post('/api/qr/generate', data);
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
  
  public async scanQRCode(qrData: string): Promise<any> {
    try {
      const response = await this.javaBackendApi.post('/api/qr/scan', { qrData });
      return response.data;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      throw error;
    }
  }
  
  public async getQRCodeHistory(): Promise<any[]> {
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
