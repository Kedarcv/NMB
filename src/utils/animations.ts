// Import all Lottie animations
// User's actual animation files

export const ANIMATIONS = {
  // Splash & App Introduction (Highest Priority)
  MOBILE_APP_SHOWCASE: '/animations/Mobile_App_Showcase.json',
  AI_TWINKLE_LOADING: '/animations/AI_twinkle_loading.json',
  
  // Gamification & Rewards (High Priority)
  GAMIFICATION: '/animations/Gamification.json',
  CHEST_TWINKLE: '/animations/chest_twinkle.json',
  SUCESSO: '/animations/Sucesso.json',
  
  // User & Profile
  PROFILE_USER_CARD: '/animations/Profile_user_card.json',
  
  // Payment & Transactions
  MOBILE_PAYMENT: '/animations/Mobile_payment.json',
  
  // Location & Maps
  LOCATION_ANIMATION: '/animations/Location_animation.json',
  
  // Main Interface
  MAIN_SCENE: '/animations/Main_Scene.json',
} as const;

// Animation presets for common use cases
export const ANIMATION_PRESETS = {
  SPLASH: {
    loop: false,
    autoplay: true,
  },
  LOADING: {
    loop: true,
    autoplay: true,
  },
  SUCCESS: {
    loop: false,
    autoplay: true,
  },
  GAMIFICATION: {
    loop: false,
    autoplay: true,
  },
  REWARD: {
    loop: false,
    autoplay: true,
  },
  UI: {
    loop: true,
    autoplay: true,
  },
} as const;

// Helper function to get animation path
export const getAnimationPath = (key: keyof typeof ANIMATIONS): string => {
  return ANIMATIONS[key];
};

// Helper function to get animation preset
export const getAnimationPreset = (preset: keyof typeof ANIMATION_PRESETS) => {
  return ANIMATION_PRESETS[preset];
};
