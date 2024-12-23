import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Button
} from '@chakra-ui/react';

interface Tutorial {
  id: string;
  title: string;
  category: 'Débutant' | 'Technique' | 'Avancé';
  description: string;
  videoUrl?: string;
  steps: string[];
  difficulty: number;
}

const ChichaTutorials: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([
    {
      id: 'prep1',
      title: 'Préparation de Base d\'une Chicha',
      category: 'Débutant',
      description: 'Apprenez les étapes fondamentales pour préparer votre première chicha',
      videoUrl: 'https://example.com/chicha-prep-video',
      steps: [
        'Nettoyer le corps de la chicha',
        'Remplir la base d\'eau',
        'Installer le foyer',
        'Répartir le tabac uniformément',
        'Allumer le charbon'
      ],
      difficulty: 2
    },
    {
      id: 'tech1',
      title: 'Techniques de Fumée Parfaite',
      category: 'Technique',
      description: 'Maîtrisez l\'art de la fumée dense et savoureuse',
      videoUrl: 'https://example.com/smoke-technique-video',
      steps: [
        'Choisir le bon type de charbon',
        'Contrôler la température',
        'Rotation du charbon',
        'Technique de tirage',
        'Entretien pendant la session'
      ],
      difficulty: 5
    },
    {
      id: 'adv1',
      title: 'Création de Mélanges Complexes',
      category: 'Avancé',
      description: 'Apprenez à créer des mélanges de tabac sophistiqués',
      videoUrl: 'https://example.com/mix-technique-video',
      steps: [
        'Comprendre les profils de saveurs',
        'Équilibrage des ingrédients',
        'Techniques de layering',
        'Expérimentation de combinaisons',
        'Conservation des mélanges'
      ],
      difficulty: 8
    }
  ]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  const openTutorialModal = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    onOpen();
  };

  return (
    <Box p={6} maxWidth="800px" margin="auto">
      <Heading mb={6} textAlign="center">
        Académie Chicha
      </Heading>

      <Accordion allowMultiple>
        {['Débutant', 'Technique', 'Avancé'].map(category => (
          <AccordionItem key={category}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Heading size="md">{category}</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                {tutorials
                  .filter(t => t.category === category)
                  .map(tutorial => (
                    <HStack 
                      key={tutorial.id} 
                      borderWidth="1px" 
                      p={3} 
                      borderRadius="md"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <VStack align="start" spacing={1}>
                        <Heading size="sm">{tutorial.title}</Heading>
                        <Text color="gray.500">{tutorial.description}</Text>
                        <HStack>
                          <Text>Difficulté:</Text>
                          {[...Array(10)].map((_, i) => (
                            <Box 
                              key={i} 
                              w="10px" 
                              h="10px" 
                              borderRadius="50%" 
                              bg={i < tutorial.difficulty ? 'green.500' : 'gray.200'}
                            />
                          ))}
                        </HStack>
                      </VStack>
                      <Button 
                        colorScheme="blue" 
                        size="sm"
                        onClick={() => openTutorialModal(tutorial)}
                      >
                        Voir Détails
                      </Button>
                    </HStack>
                  ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedTutorial?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTutorial && (
              <VStack spacing={4} align="stretch">
                {selectedTutorial.videoUrl && (
                  <Box>
                    <Heading size="sm" mb={2}>Vidéo Tutoriel</Heading>
                    <iframe 
                      width="100%" 
                      height="315" 
                      src={selectedTutorial.videoUrl} 
                      title="Tutorial Video"
                      allowFullScreen
                    />
                  </Box>
                )}

                <Box>
                  <Heading size="sm" mb={2}>Étapes</Heading>
                  <VStack align="start" spacing={2}>
                    {selectedTutorial.steps.map((step, index) => (
                      <HStack key={index} width="100%">
                        <Text fontWeight="bold">{index + 1}.</Text>
                        <Text>{step}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChichaTutorials;
