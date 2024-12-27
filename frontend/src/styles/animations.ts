import { keyframes, css } from '@emotion/react';

// Types pour les configurations d'animation
interface AnimationConfig {
  duration?: number;
  delay?: number;
  timingFunction?: string;
}

// Types pour les propriétés d'animation
interface AnimationProps {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
}

// Définition des keyframes réutilisables
export const keyframeAnimations = {
  // Animation de fade in
  fadeIn: keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `,

  // Animation de slide from right
  slideFromRight: keyframes`
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,

  // Animation de scale
  scaleUp: keyframes`
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,

  // Animation de rotation
  rotate: keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `
};

// Générateur de styles d'animation dynamiques
export const createAnimation = (
  animationType: keyof typeof keyframeAnimations, 
  config: AnimationConfig = {}
) => {
  const {
    duration = 500,
    delay = 0,
    timingFunction = 'ease-in-out'
  } = config;

  return css`
    animation: ${keyframeAnimations[animationType]} ${duration}ms ${timingFunction} ${delay}ms forwards;
  `;
};

// Générateur de transformations personnalisées
export const createTransform = (props: AnimationProps = {}) => {
  const {
    x = 0,
    y = 0,
    scale = 1,
    rotate = 0,
    opacity = 1
  } = props;

  return css`
    transform: 
      translateX(${x}px) 
      translateY(${y}px) 
      scale(${scale}) 
      rotate(${rotate}deg);
    opacity: ${opacity};
  `;
};

// Hook personnalisé pour les animations
export const useAnimations = () => {
  // Fonction pour déclencher des animations
  const triggerAnimation = (
    element: HTMLElement, 
    animationType: keyof typeof keyframeAnimations,
    config: AnimationConfig = {}
  ) => {
    const { 
      duration = 500, 
      delay = 0, 
      timingFunction = 'ease-in-out' 
    } = config;

    element.style.animation = `
      ${keyframeAnimations[animationType]} 
      ${duration}ms 
      ${timingFunction} 
      ${delay}ms 
      forwards
    `;
  };

  // Fonction pour réinitialiser les animations
  const resetAnimation = (element: HTMLElement) => {
    element.style.animation = 'none';
  };

  return {
    triggerAnimation,
    resetAnimation,
    animations: keyframeAnimations
  };
};

// Composant wrapper pour les animations
export const AnimatedComponent: React.FC<{
  children: React.ReactNode;
  animation?: keyof typeof keyframeAnimations;
  config?: AnimationConfig;
  className?: string;
}> = ({ 
  children, 
  animation = 'fadeIn', 
  config = {}, 
  className = '' 
}) => {
  const animationStyle = createAnimation(animation, config);

  return (
    <div 
      css={animationStyle} 
      className={className}
    >
      {children}
    </div>
  );
};

// Exemples d'utilisation des animations
export const AnimationExamples: React.FC = () => {
  const { triggerAnimation } = useAnimations();

  const handleHoverAnimation = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    triggerAnimation(target, 'scaleUp', { duration: 300 });
  };

  return (
    <div>
      <AnimatedComponent 
        animation="slideFromRight" 
        config={{ duration: 800, delay: 200 }}
      >
        <div 
          onMouseEnter={handleHoverAnimation}
          css={css`
            padding: 20px;
            background-color: #f0f0f0;
          `}
        >
          Élément animé
        </div>
      </AnimatedComponent>
    </div>
  );
};
