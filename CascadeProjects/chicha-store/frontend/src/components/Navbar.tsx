import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge 
} from '@mui/material';
import { 
  ShoppingCart as CartIcon, 
  AccountCircle as ProfileIcon 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Chicha Store
          </Link>
        </Typography>
        <Button color="inherit" component={Link} to="/products">
          Produits
        </Button>
        <IconButton color="inherit" component={Link} to="/cart">
          <Badge badgeContent={0} color="secondary">
            <CartIcon />
          </Badge>
        </IconButton>
        <IconButton color="inherit" component={Link} to="/login">
          <ProfileIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
