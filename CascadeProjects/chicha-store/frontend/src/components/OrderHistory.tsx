import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { fetchUserOrders } from '../services/userService';
import { useNotification } from '../contexts/NotificationContext';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const userOrders = await fetchUserOrders();
        setOrders(userOrders);
      } catch (error) {
        showNotification('Erreur de chargement des commandes', 'error');
      }
    };

    loadOrders();
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
    }
  };

  const handleOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Historique des Commandes
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N° Commande</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>{order.total.toFixed(2)} €</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    onClick={() => handleOrderDetails(order)}
                  >
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={!!selectedOrder} 
        onClose={handleCloseOrderDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Détails de la Commande {selectedOrder.id}
            </DialogTitle>
            <DialogContent>
              <Typography>
                Date : {new Date(selectedOrder.date).toLocaleDateString()}
              </Typography>
              <Typography>
                Total : {selectedOrder.total.toFixed(2)} €
              </Typography>
              <Typography>
                Statut : 
                <Chip 
                  label={selectedOrder.status} 
                  color={getStatusColor(selectedOrder.status)} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Typography>

              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produit</TableCell>
                      <TableCell>Quantité</TableCell>
                      <TableCell>Prix</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  );
};
