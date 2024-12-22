import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  Tabs, 
  Tab, 
  Box 
} from '@mui/material';
import { 
  Person as ProfileIcon, 
  ShoppingCart as OrderIcon 
} from '@mui/icons-material';
import { getCurrentUser, User } from '../services/authService';
import { fetchUserOrders, Order } from '../services/orderService';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setUserDetails({
          name: currentUser.name,
          email: currentUser.email
        });

        try {
          const userOrders = await fetchUserOrders();
          setOrders(userOrders);
        } catch (error) {
          console.error('Erreur lors de la récupération des commandes', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditMode(!editMode);
  };

  const handleSaveProfile = () => {
    // Logique de mise à jour du profil
    setEditMode(false);
  };

  const renderProfileContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {editMode ? (
          <>
            <TextField
              fullWidth
              label="Nom"
              value={userDetails.name}
              onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              value={userDetails.email}
              onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveProfile}
              sx={{ mr: 2 }}
            >
              Enregistrer
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleEditProfile}
            >
              Annuler
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h6">Informations personnelles</Typography>
            <Typography>Nom : {userDetails.name}</Typography>
            <Typography>Email : {userDetails.email}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleEditProfile}
              sx={{ mt: 2 }}
            >
              Modifier le profil
            </Button>
          </>
        )}
      </Grid>
    </Grid>
  );

  const renderOrdersContent = () => (
    <Grid container spacing={3}>
      {orders.length === 0 ? (
        <Grid item xs={12}>
          <Typography>Vous n'avez pas encore passé de commande.</Typography>
        </Grid>
      ) : (
        orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">
                    Commande #{order.id}
                  </Typography>
                  <Typography variant="body2">
                    Total : {order.total.toFixed(2)} €
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    Statut : {order.status}
                  </Typography>
                  <Typography variant="body2">
                    Date : {new Date(order.createdAt || '').toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))
      )}
    </Grid>
  );

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Mon Compte
      </Typography>
      
      <Paper elevation={3}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
        >
          <Tab icon={<ProfileIcon />} label="Profil" />
          <Tab icon={<OrderIcon />} label="Mes Commandes" />
        </Tabs>
        
        <Box p={3}>
          {tabValue === 0 && renderProfileContent()}
          {tabValue === 1 && renderOrdersContent()}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
