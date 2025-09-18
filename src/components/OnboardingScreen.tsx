import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Container,
  Fade,
  Slide,
} from '@mui/material';
import {
  Loyalty as LoyaltyIcon,
  Psychology as PsychologyIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import xplugLogo from '../xplug_logo.png';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: 'Welcome to LoyaltyIQ™',
    subtitle: 'Your AI-powered loyalty companion',
    description: 'Discover a smarter way to earn rewards, get insights, and stay engaged with your favorite brands.',
    icon: <LoyaltyIcon sx={{ fontSize: 80, color: '#1976D2' }} />,
    color: '#1976D2',
  },
  {
    title: 'X-plug™ Powered Insights',
    subtitle: 'Smart recommendations and analytics powered by X-plug™',
    description: 'Get personalized insights about your spending patterns, earning opportunities, and optimal redemption strategies.',
    icon: <PsychologyIcon sx={{ fontSize: 80, color: '#9C27B0' }} />,
    color: '#9C27B0',
  },
  {
    title: 'Location-Based Rewards',
    subtitle: 'Earn points wherever you go',
    description: 'Check in at partner locations, discover nearby offers, and earn points for your daily activities.',
    icon: <LocationIcon sx={{ fontSize: 80, color: '#4CAF50' }} />,
    color: '#4CAF50',
  },
  {
    title: 'Gamified Experience',
    subtitle: 'Level up and unlock achievements',
    description: 'Complete daily challenges, participate in quizzes, and unlock special rewards through our engaging gamification system.',
    icon: <TrophyIcon sx={{ fontSize: 80, color: '#FF9800' }} />,
    color: '#FF9800',
  },
  {
    title: 'Ready to Start?',
    subtitle: 'Your loyalty journey begins now',
    description: 'Join thousands of users who are already earning more and saving smarter with LoyaltyIQ.',
    icon: <CheckIcon sx={{ fontSize: 80, color: '#4CAF50' }} />,
    color: '#4CAF50',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep === onboardingSteps.length - 1) {
      onComplete();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStep = onboardingSteps[activeStep];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LoyaltyIcon sx={{ fontSize: 32, color: 'white' }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            LoyaltyIQ
          </Typography>
        </Box>
        <Button
          variant="text"
          onClick={handleSkip}
          sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: 'white' } }}
        >
          Skip
        </Button>
      </Box>

      {/* Progress Stepper */}
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {onboardingSteps.map((_, index) => (
            <Step key={index}>
              <StepLabel />
            </Step>
          ))}
        </Stepper>
      </Container>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Slide direction="left" in={true} mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              width: '100%',
              background: 'white',
            }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${currentStep.color}20 0%, ${currentStep.color}10 100%)`,
                p: 6,
                textAlign: 'center',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Icon */}
              <Fade in={true} timeout={800}>
                <Box sx={{ mb: 4 }}>
                  {currentStep.icon}
                </Box>
              </Fade>

              {/* Content */}
              <Fade in={true} timeout={600}>
                <Box sx={{ maxWidth: 500 }}>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {currentStep.title}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: currentStep.color,
                      fontWeight: 600,
                      mb: 3,
                    }}
                  >
                    {currentStep.subtitle}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      fontSize: '1.1rem',
                    }}
                  >
                    {currentStep.description}
                  </Typography>
                </Box>
              </Fade>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{ minWidth: 100 }}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                size="large"
                sx={{
                  minWidth: 120,
                  background: `linear-gradient(135deg, ${currentStep.color} 0%, ${currentStep.color}dd 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${currentStep.color}dd 0%, ${currentStep.color} 100%)`,
                  },
                }}
              >
                {activeStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
            </Box>
          </Paper>
        </Slide>
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Powered by
          </Typography>
          <Box
            component="img"
            src={xplugLogo}
            alt="XPLU Logo"
            sx={{
              height: 25,
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              opacity: 0.8,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingScreen;
