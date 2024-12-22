import React from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Box 
} from '@mui/material';
import { 
  Facebook as FacebookIcon, 
  Instagram as InstagramIcon, 
  Twitter as TwitterIcon 
} from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: 'primary.main', 
        color: 'white', 
        py: 4,
        mt: 'auto' 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Chicha Store
            </Typography>
            <Typography variant="body2">
              Votre boutique en ligne spécialisée dans les chichas et accessoires.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Liens Rapides
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/products" color="inherit" underline="hover">
                Nos Produits
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                À Propos
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contact
              </Link>
              <Link href="/conditions" color="inherit" underline="hover">
                Conditions Générales
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Suivez-nous
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="#" color="inherit">
                <FacebookIcon />
              </Link>
              <Link href="#" color="inherit">
                <InstagramIcon />
              </Link>
              <Link href="#" color="inherit">
                <TwitterIcon />
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Chicha Store. Tous droits réservés.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
