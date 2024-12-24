import React, { useState } from 'react';
import { Box, Button, VStack, Text } from '@chakra-ui/react';
import { animations, useAnimatedInteraction, AnimatedComponent } from '../styles/animations';

export const AnimatedInteractionDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const { animateClick, animateHover } = useAnimatedInteraction();

  const handleInteraction = (event: React.MouseEvent) => {
    animateClick(event);
    setCount(prev => prev + 1);
  };

  return (
    <VStack spacing={6} p={6} bg="gray.50" borderRadius="lg">
      <AnimatedComponent animationType="slideIn">
        <Box 
          p={4} 
          bg="white" 
          borderRadius="md" 
          boxShadow="md"
          transition="all 0.3s"
          _hover={{
            transform: 'scale(1.02)',
            boxShadow: 'lg'
          }}
          onMouseEnter={animateHover}
        >
          <Text fontWeight="bold" textAlign="center">
            Interactions Dynamiques
          </Text>
        </Box>
      </AnimatedComponent>

      <Button 
        colorScheme="blue" 
        onClick={handleInteraction}
        sx={{
          animation: `${animations.interaction.pulse} 2s infinite`,
          '&:hover': {
            animation: `${animations.interaction.wiggle} 0.5s`
          }
        }}
      >
        Cliquez-moi ! (Clics : {count})
      </Button>

      <Box 
        w="full" 
        h="100px" 
        bg="gray.200" 
        borderRadius="md"
        sx={{
          animation: `${animations.loading.skeleton} 1.5s infinite`,
          backgroundImage: 'linear-gradient(90deg, #f0f0f0 0px, rgba(206, 206, 206, 0.5) 40px, #f0f0f0 80px)',
          backgroundSize: '200px 100%',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </VStack>
  );
};
