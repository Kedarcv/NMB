import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  animationData?: any;
  animationPath?: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onComplete?: () => void;
  fallback?: React.ReactNode;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  animationPath,
  loop = true,
  autoplay = true,
  style = {},
  className = '',
  onComplete,
  fallback = null,
}) => {
  const [animation, setAnimation] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadAnimation = async () => {
      if (animationData) {
        setAnimation(animationData);
        return;
      }

      if (animationPath) {
        setLoading(true);
        try {
          const response = await fetch(animationPath);
          if (!response.ok) {
            throw new Error(`Failed to load animation: ${response.status}`);
          }
          const data = await response.json();
          
          // Validate animation data
          if (!data || typeof data !== 'object' || !data.v || !data.fr) {
            throw new Error('Invalid animation data format');
          }
          
          setAnimation(data);
          setError(false);
        } catch (err) {
          console.error('Error loading animation:', err);
          setError(true);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAnimation();
  }, [animationData, animationPath]);

  if (loading) {
    return fallback ? <>{fallback}</> : <div style={style} className={className}>Loading...</div>;
  }

  if (error || !animation) {
    return fallback ? <>{fallback}</> : <div style={style} className={className}>Animation not available</div>;
  }

  return (
    <Lottie
      animationData={animation}
      loop={loop}
      autoplay={autoplay}
      style={style}
      className={className}
      onComplete={onComplete}
    />
  );
};

export default LottieAnimation;
