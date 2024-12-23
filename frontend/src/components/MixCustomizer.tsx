import React, { useState } from 'react';
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
  Checkbox,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure
} from '@chakra-ui/react';

interface Ingredient {
  id: string;
  name: string;
  category: 'Tabac' | 'Fruit' | 'Épice';
  intensity: number;
}

interface CustomMix {
  name: string;
  ingredients: Ingredient[];
  totalIntensity: number;
}

const MixCustomizer: React.FC = () => {
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([
    { id: 'tabac1', name: 'Tabac Blond', category: 'Tabac', intensity: 7 },
    { id: 'tabac2', name: 'Tabac Brun', category: 'Tabac', intensity: 9 },
    { id: 'fruit1', name: 'Pomme', category: 'Fruit', intensity: 5 },
    { id: 'fruit2', name: 'Mangue', category: 'Fruit', intensity: 8 },
    { id: 'epice1', name: 'Cannelle', category: 'Épice', intensity: 6 },
    { id: 'epice2', name: 'Cardamome', category: 'Épice', intensity: 7 }
  ]);

  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentMix, setCurrentMix] = useState<CustomMix | null>(null);

  const toggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients(prev => 
      prev.find(i => i.id === ingredient.id)
        ? prev.filter(i => i.id !== ingredient.id)
        : [...prev, ingredient]
    );
  };

  const createMix = () => {
    const totalIntensity = selectedIngredients.reduce(
      (sum, ingredient) => sum + ingredient.intensity, 
      0
    );

    const mixName = `Mélange Personnalisé ${new Date().toLocaleDateString()}`;

    const newMix: CustomMix = {
      name: mixName,
      ingredients: selectedIngredients,
      totalIntensity
    };

    setCurrentMix(newMix);
    onOpen();
  };

  return (
    <Box p={6} maxWidth="600px" margin="auto">
      <Heading mb={6} textAlign="center">
        Créez Votre Mélange Unique
      </Heading>

      <VStack spacing={4}>
        <Box width="100%">
          <Heading size="md" mb={4}>Ingrédients Disponibles</Heading>
          {availableIngredients.map(ingredient => (
            <HStack 
              key={ingredient.id} 
              mb={2} 
              borderWidth="1px" 
              p={2} 
              borderRadius="md"
            >
              <Checkbox 
                isChecked={selectedIngredients.some(i => i.id === ingredient.id)}
                onChange={() => toggleIngredient(ingredient)}
              >
                {ingredient.name} ({ingredient.category})
              </Checkbox>
              <Text ml="auto" color="gray.500">
                Intensité: {ingredient.intensity}/10
              </Text>
            </HStack>
          ))}
        </Box>

        <Button 
          colorScheme="green" 
          onClick={createMix}
          width="100%"
          isDisabled={selectedIngredients.length === 0}
        >
          Créer Mon Mélange
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Votre Mélange Personnalisé</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentMix && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md">{currentMix.name}</Heading>
                  <Text>Intensité Totale: {currentMix.totalIntensity}/20</Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Composition</Heading>
                  {currentMix.ingredients.map(ingredient => (
                    <HStack 
                      key={ingredient.id} 
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Text>{ingredient.name}</Text>
                      <Text color="gray.500">
                        {ingredient.category} - Intensité {ingredient.intensity}
                      </Text>
                    </HStack>
                  ))}
                </Box>

                <Button 
                  colorScheme="blue" 
                  onClick={() => {
                    // Logique pour ajouter au panier
                    onClose();
                  }}
                >
                  Ajouter au Panier
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MixCustomizer;
