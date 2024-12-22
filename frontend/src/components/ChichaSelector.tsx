import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Slider, 
  SliderTrack, 
  SliderFilledTrack, 
  SliderThumb,
  Select,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure
} from '@chakra-ui/react';

interface ChichaPreference {
  smokeDensity: number;
  flavorIntensity: number;
  preferredFlavors: string[];
  experienceLevel: 'Débutant' | 'Intermédiaire' | 'Expert';
}

interface ChichaRecommendation {
  name: string;
  description: string;
  suitability: number;
  imageUrl: string;
}

const ChichaSelector: React.FC = () => {
  const [preferences, setPreferences] = useState<ChichaPreference>({
    smokeDensity: 5,
    flavorIntensity: 5,
    preferredFlavors: [],
    experienceLevel: 'Débutant'
  });

  const [recommendations, setRecommendations] = useState<ChichaRecommendation[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const flavorOptions = [
    'Fruits', 
    'Menthe', 
    'Café', 
    'Épicé', 
    'Tropical', 
    'Classique'
  ];

  const experienceLevels = [
    'Débutant', 
    'Intermédiaire', 
    'Expert'
  ];

  const findRecommendations = () => {
    // Algorithme de recommandation simplifié
    const mockRecommendations: ChichaRecommendation[] = [
      {
        name: 'Chicha Débutant',
        description: 'Parfait pour les nouveaux fumeurs, saveur douce et légère',
        suitability: 90,
        imageUrl: '/images/chicha-debutant.jpg'
      },
      {
        name: 'Chicha Intense',
        description: 'Pour les amateurs de saveurs prononcées et de fumée dense',
        suitability: 75,
        imageUrl: '/images/chicha-intense.jpg'
      }
    ];

    setRecommendations(mockRecommendations);
    onOpen();
  };

  const updatePreference = (key: keyof ChichaPreference, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Box p={6} maxWidth="600px" margin="auto">
      <Heading mb={6} textAlign="center">
        Trouvez Votre Chicha Parfaite
      </Heading>

      <VStack spacing={4}>
        <Box width="100%">
          <Text mb={2}>Densité de Fumée</Text>
          <Slider 
            defaultValue={5} 
            min={1} 
            max={10}
            onChange={(val) => updatePreference('smokeDensity', val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>

        <Box width="100%">
          <Text mb={2}>Intensité des Saveurs</Text>
          <Slider 
            defaultValue={5} 
            min={1} 
            max={10}
            onChange={(val) => updatePreference('flavorIntensity', val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>

        <Box width="100%">
          <Text mb={2}>Saveurs Préférées</Text>
          <Select 
            isMulti 
            placeholder="Sélectionnez vos saveurs"
            options={flavorOptions.map(flavor => ({ value: flavor, label: flavor }))}
            onChange={(selected) => 
              updatePreference('preferredFlavors', 
                selected.map(item => item.value)
              )
            }
          />
        </Box>

        <Box width="100%">
          <Text mb={2}>Niveau d'Expérience</Text>
          <Select 
            placeholder="Votre niveau"
            options={experienceLevels.map(level => ({ value: level, label: level }))}
            onChange={(selected) => 
              updatePreference('experienceLevel', selected.value)
            }
          />
        </Box>

        <Button 
          colorScheme="blue" 
          onClick={findRecommendations}
          width="100%"
        >
          Trouver Ma Chicha
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recommandations Personnalisées</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {recommendations.map(chicha => (
              <Box 
                key={chicha.name} 
                borderWidth="1px" 
                borderRadius="lg" 
                p={4} 
                mb={4}
              >
                <HStack>
                  <Box flex="1">
                    <Heading size="md">{chicha.name}</Heading>
                    <Text>{chicha.description}</Text>
                    <Text fontWeight="bold">
                      Correspondance: {chicha.suitability}%
                    </Text>
                  </Box>
                  <Box>
                    <img 
                      src={chicha.imageUrl} 
                      alt={chicha.name} 
                      style={{ maxWidth: '150px' }} 
                    />
                  </Box>
                </HStack>
              </Box>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChichaSelector;
