import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Select,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Badge,
  Divider,
  useDisclosure
} from '@chakra-ui/react';

interface SubscriptionProduct {
  id: string;
  name: string;
  category: string;
  basePrice: number;
}

interface Subscription {
  id: string;
  product: SubscriptionProduct;
  frequency: 'Mensuel' | 'Trimestriel' | 'Semestriel';
  nextDeliveryDate: Date;
  discount: number;
}

const SubscriptionManager: React.FC = () => {
  const [availableProducts, setAvailableProducts] = useState<SubscriptionProduct[]>([
    { 
      id: 'chicha1', 
      name: 'Chicha Premium', 
      category: 'Chicha Complète', 
      basePrice: 150 
    },
    { 
      id: 'tabac1', 
      name: 'Mélange de Tabac Artisanal', 
      category: 'Tabac', 
      basePrice: 50 
    },
    { 
      id: 'accessoire1', 
      name: 'Kit d\'Entretien Complet', 
      category: 'Accessoires', 
      basePrice: 30 
    }
  ]);

  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<Subscription['frequency']>('Mensuel');
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const calculateDiscount = (frequency: Subscription['frequency']): number => {
    switch(frequency) {
    case 'Trimestriel': return 10;  // 10% de réduction
    case 'Semestriel': return 20;   // 20% de réduction
    default: return 0;
    }
  };

  const createSubscription = () => {
    if (!selectedProduct) return;

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      product: selectedProduct,
      frequency: selectedFrequency,
      nextDeliveryDate: new Date(
        new Date().setMonth(
          new Date().getMonth() + 
          (selectedFrequency === 'Mensuel' ? 1 : 
            selectedFrequency === 'Trimestriel' ? 3 : 6)
        )
      ),
      discount: calculateDiscount(selectedFrequency)
    };

    setActiveSubscriptions(prev => [...prev, newSubscription]);
    onClose();
  };

  const cancelSubscription = (subscriptionId: string) => {
    setActiveSubscriptions(prev => 
      prev.filter(sub => sub.id !== subscriptionId)
    );
  };

  return (
    <Box p={6} maxWidth="700px" margin="auto">
      <Heading mb={6} textAlign="center">
        Abonnements Chicha
      </Heading>

      <VStack spacing={4}>
        <Box width="100%">
          <Heading size="md" mb={4}>Créer un Nouvel Abonnement</Heading>
          
          <VStack spacing={3}>
            <Select 
              placeholder="Sélectionnez un produit"
              onChange={(e) => {
                const product = availableProducts.find(p => p.id === e.target.value);
                setSelectedProduct(product || null);
              }}
            >
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.basePrice}€
                </option>
              ))}
            </Select>

            <Select 
              placeholder="Fréquence de livraison"
              onChange={(e) => setSelectedFrequency(e.target.value as Subscription['frequency'])}
            >
              <option value="Mensuel">Mensuel (0% réduction)</option>
              <option value="Trimestriel">Trimestriel (10% réduction)</option>
              <option value="Semestriel">Semestriel (20% réduction)</option>
            </Select>

            <Button 
              colorScheme="green" 
              width="100%"
              isDisabled={!selectedProduct || !selectedFrequency}
              onClick={createSubscription}
            >
              Créer l'Abonnement
            </Button>
          </VStack>
        </Box>

        <Divider />

        <Box width="100%">
          <Heading size="md" mb={4}>Mes Abonnements Actifs</Heading>
          
          {activeSubscriptions.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              Aucun abonnement actif
            </Text>
          ) : (
            activeSubscriptions.map(subscription => (
              <HStack 
                key={subscription.id} 
                borderWidth="1px" 
                p={3} 
                borderRadius="md" 
                mb={2}
                justifyContent="space-between"
              >
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{subscription.product.name}</Text>
                  <HStack>
                    <Badge colorScheme="blue">{subscription.frequency}</Badge>
                    <Text>
                      Prochaine livraison : {subscription.nextDeliveryDate.toLocaleDateString()}
                    </Text>
                  </HStack>
                  <Text>
                    Prix : {subscription.product.basePrice}€ 
                    {subscription.discount > 0 && ` (${subscription.discount}% de réduction)`}
                  </Text>
                </VStack>
                <Button 
                  colorScheme="red" 
                  size="sm"
                  onClick={() => cancelSubscription(subscription.id)}
                >
                  Annuler
                </Button>
              </HStack>
            ))
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default SubscriptionManager;
