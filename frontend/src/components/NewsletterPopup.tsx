import React, { useState, useEffect } from 'react';
import { FaTimes, FaEnvelope } from 'react-icons/fa';
import { Box, VStack, Input, Button, Text, useToast } from '@chakra-ui/react';
import { subscribeToNewsletter } from '../services/marketingService';
import { animations, useAnimatedInteraction, AnimatedComponent } from '../styles/animations';
import { useAccessibility } from '../hooks/useAccessibility';

interface NewsletterPopupProps {
  onClose: () => void;
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPopup, setShowPopup] = useState(false);
  const { animateClick, animateHover } = useAnimatedInteraction();
  const { accessibilityOptions } = useAccessibility();
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      const lastPopupShown = localStorage.getItem('newsletter_popup_timestamp');
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      if (!lastPopupShown || parseInt(lastPopupShown) < oneDayAgo) {
        setShowPopup(true);
        localStorage.setItem('newsletter_popup_timestamp', Date.now().toString());
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await subscribeToNewsletter(email);
      setStatus('success');
      
      toast({
        title: "Inscription réussie !",
        description: "Vous êtes maintenant abonné à notre newsletter.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      });

      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 3000);
    } catch (error) {
      setStatus('error');
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
  };

  if (!showPopup) return null;

  return (
    <AnimatedComponent animationType="fadeIn">
      <Box 
        position="fixed" 
        top="0" 
        left="0" 
        width="100%" 
        height="100%" 
        bg="rgba(0,0,0,0.5)" 
        zIndex={1000} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-title"
      >
        <VStack 
          bg="white" 
          p={8} 
          borderRadius="lg" 
          spacing={6} 
          maxWidth="500px" 
          position="relative"
          boxShadow="xl"
          sx={{
            animation: `${animations.hover.scale} 2s infinite`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: 'lg'
            }
          }}
        >
          <Button 
            position="absolute" 
            top={4} 
            right={4} 
            onClick={(e) => {
              animateClick(e);
              setShowPopup(false);
              onClose();
            }}
            aria-label="Fermer le popup"
            variant="ghost"
            colorScheme="red"
          >
            <FaTimes />
          </Button>

          <Box 
            as={FaEnvelope} 
            w={16} 
            h={16} 
            color="blue.500"
            sx={{
              animation: `${animations.interaction.pulse} 2s infinite`
            }}
          />

          <Text 
            id="newsletter-title" 
            fontSize={`${accessibilityOptions.fontSize + 4}px`} 
            fontWeight="bold" 
            textAlign="center"
          >
            Rejoignez Notre Communauté Chicha
          </Text>

          <Text textAlign="center" fontSize={`${accessibilityOptions.fontSize}px`}>
            Inscrivez-vous à notre newsletter et recevez 10% de réduction sur votre première commande !
          </Text>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <Input 
                type="email" 
                placeholder="Votre email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
                onMouseEnter={animateHover}
                aria-label="Email pour la newsletter"
              />
              <Button 
                type="submit" 
                colorScheme="blue" 
                width="full" 
                disabled={status !== 'idle'}
                onClick={animateClick}
                sx={{
                  '&:hover': {
                    animation: `${animations.interaction.wiggle} 0.5s`
                  }
                }}
              >
                {status === 'idle' 
                  ? 'Je m\'inscris' 
                  : status === 'success' 
                    ? 'Inscription réussie !' 
                    : 'Erreur'}
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </AnimatedComponent>
  );
};

export default NewsletterPopup;
