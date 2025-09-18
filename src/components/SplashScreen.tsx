import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import xplugLogo from '../xplug_logo.png';
import LottieAnimation from './common/LottieAnimation';
import { ANIMATIONS, ANIMATION_PRESETS } from '../utils/animations';

const SplashScreen: React.FC = () => {
  const [showContent, setShowContent] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // Show content after a brief delay for smooth animation
    const timer1 = setTimeout(() => setShowContent(true), 2000);
    // Show loading animation after content appears
    const timer2 = setTimeout(() => setShowLoading(true), 5000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      }}
    >
      <Fade in={showContent} timeout={1000}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* Main Logo with Lottie Animation */}
          <Box
            sx={{
              width: 400,
              height: 400,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
            }}
          >
            <LottieAnimation
              animationPath={ANIMATIONS.MOBILE_APP_SHOWCASE}
              {...ANIMATION_PRESETS.SPLASH}
              style={{ width: '100%', height: '100%' }}
            />
          </Box>

          {/* App Title */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                color: 'white',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                mb: 1,
              }}
            >
              LoyaltyIQ
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Loyalty that learns, adapts, and predicts
            </Typography>
          </Box>

          {/* AI Loading Animation */}
          {showLoading && (
            <Fade in={showLoading} timeout={500}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 80, height: 80 }}>
                  <LottieAnimation
                    animationPath={ANIMATIONS.AI_TWINKLE_LOADING}
                    {...ANIMATION_PRESETS.LOADING}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 500,
                  }}
                >
                  X-plug Initializing...
                </Typography>
              </Box>
            </Fade>
          )}

          {/* XPLU Logo */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
              }}
            >
              © Powered by 
            </Typography>
            <Box
              component="img"
              src={xplugLogo}
              alt="X-plug™"
              sx={{
                height: 50,
                width: 'auto',
                
              }}
            />
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default SplashScreen;
