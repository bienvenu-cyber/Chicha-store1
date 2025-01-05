import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Badge,
  Box,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ShoppingCart as CartIcon, 
  Home as HomeIcon, 
  Store as ProductIcon, 
  Article as ArticleIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  Archive as ArchiveIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const menuItems = [
    { 
      text: 'Accueil', 
      icon: <HomeIcon />, 
      path: '/' 
    },
    { 
      text: 'Produits', 
      icon: <ProductIcon />, 
      path: '/products' 
    },
    { 
      text: 'Articles', 
      icon: <ArticleIcon />, 
      path: '/articles' 
    },
    { 
      text: 'Connexion', 
      icon: <LoginIcon />, 
      path: '/login' 
    }
  ];

  const adminItems = [
    {
      text: 'Créer un Article', 
      icon: <CreateIcon />, 
      path: '/admin/articles/new'
    },
    {
      text: 'Analytics Articles', 
      icon: <DashboardIcon />, 
      path: '/admin/article-analytics'
    },
    {
      text: 'Archives Analytics', 
      icon: <ArchiveIcon />, 
      path: '/admin/analytics-archives'
    },
    {
      text: 'Rapports Personnalisés', 
      icon: <AssessmentIcon />, 
      path: '/admin/analytics-reports'
    }
  ];

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}

        {user?.isAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ px: 2, color: 'text.secondary' }}>
              Administration
            </Typography>
            {adminItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={RouterLink} 
                to={item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            Chicha Store
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                component={RouterLink}
                to={item.path}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}

            {user?.isAdmin && (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin/articles/new"
                  startIcon={<CreateIcon />}
                >
                  Créer Article
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin/article-analytics"
                  startIcon={<DashboardIcon />}
                >
                  Analytics
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin/analytics-archives"
                  startIcon={<ArchiveIcon />}
                >
                  Archives
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin/analytics-reports"
                  startIcon={<AssessmentIcon />}
                >
                  Rapports
                </Button>
              </>
            )}
          </Box>

          <IconButton 
            color="inherit" 
            component={RouterLink} 
            to="/cart"
          >
            <Badge badgeContent={cartItems.length} color="error">
              <CartIcon />
            </Badge>
          </IconButton>

          {user ? (
            <Button 
              color="inherit"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Déconnexion
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerList()}
      </Drawer>
    </>
  );
};

export default Navbar;
