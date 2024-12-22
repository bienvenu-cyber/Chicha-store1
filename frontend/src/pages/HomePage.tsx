import React from 'react';
import { Container, Typography, Grid, Button } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h2" align="center" gutterBottom>
        Bienvenue chez Chicha Store
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4">
            Découvrez notre collection unique
          </Typography>
          <Typography variant="body1" paragraph>
            Les meilleures chichas et accessoires sélectionnés avec passion.
          </Typography>
          <Button variant="contained" color="primary">
            Voir nos produits
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Espace pour une image ou carousel */}
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
