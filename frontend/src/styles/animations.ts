import { keyframes } from '@emotion/react';

// Animations de base
export const animations = {
  // Animations de survol
  hover: {
    scale: keyframes`
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    `,
    shadow: keyframes`
      0% { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      50% { box-shadow: 0 8px 12px rgba(0,0,0,0.15); }
      100% { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    `
  },

  // Animations d'entrée
  enter: {
    fadeIn: keyframes`
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    `,
    slideIn: keyframes`
      from { 
        opacity: 0; 
        transform: translateX(-50px); 
      }
      to { 
        opacity: 1; 
        transform: translateX(0); 
      }
    `
  },

  // Animations interactives
  interaction: {
    pulse: keyframes`
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    `,
    wiggle: keyframes`
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-5deg); }
      75% { transform: rotate(5deg); }
    `
  },

  // Animations de chargement
  loading: {
    spinner: keyframes`
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    `,
    skeleton: keyframes`
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    `
  }
};

// Hooks personnalisés pour les animations
export const useAnimatedInteraction = () => {
  const animateClick = (event: React.MouseEvent) => {
    const target = event.currentTarget;
    target.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.95)' },
      { transform: 'scale(1)' }
    ], {
      duration: 200,
      easing: 'ease-in-out'
    });
  };

  const animateHover = (event: React.MouseEvent) => {
    const target = event.currentTarget;
    target.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
  };

  return { animateClick, animateHover };
};

// Composant wrapper avec animations
export const AnimatedComponent = ({ 
  children, 
  animationType = 'fadeIn',
  duration = 500,
  delay = 0 
}: {
  children: React.ReactNode,
  animationType?: keyof typeof animations.enter,
  duration?: number,
  delay?: number
}) => {
  const animationStyle = {
    animation: `${animations.enter[animationType]} ${duration}ms ease-out`,
    animationDelay: `${delay}ms`,
    opacity: 0,
    transform: 'translateY(20px)',
    willChange: 'transform, opacity'
  };

  return (
    <div style={animationStyle}>
      {children}
    </div>
  );
};
