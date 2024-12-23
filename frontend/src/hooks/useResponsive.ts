import { useBreakpointValue } from '@chakra-ui/react';

interface ResponsiveConfig {
  base: any;
  sm?: any;
  md?: any;
  lg?: any;
  xl?: any;
  '2xl'?: any;
}

export const useResponsive = <T>(config: ResponsiveConfig): T => {
  return useBreakpointValue(config) as T;
};

// Hooks spécifiques
export const useResponsiveSpacing = () => {
  return {
    containerPadding: useResponsive({
      base: 2,
      md: 4,
      lg: 6
    }),
    cardSpacing: useResponsive({
      base: 2,
      md: 4,
      lg: 6
    })
  };
};

export const useResponsiveFontSizes = () => {
  return {
    title: useResponsive({
      base: 'xl',
      md: '2xl',
      lg: '3xl'
    }),
    subtitle: useResponsive({
      base: 'lg',
      md: 'xl',
      lg: '2xl'
    }),
    body: useResponsive({
      base: 'sm',
      md: 'md',
      lg: 'lg'
    })
  };
};

export const useResponsiveLayout = () => {
  const isMobile = useResponsive({
    base: true,
    md: false
  });

  const isTablet = useResponsive({
    base: false,
    md: true,
    lg: false
  });

  const isDesktop = useResponsive({
    base: false,
    lg: true
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
    layout: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
};
