import React from 'react';
import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText 
} from '@mui/material';
import { 
    Dashboard as DashboardIcon, 
    Inventory as ProductIcon, 
    People as UserIcon, 
    ShoppingCart as OrderIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                },
            }}
        >
            <List>
                <ListItem button onClick={() => handleNavigation('/dashboard')}>
                    <ListItemIcon><DashboardIcon /></ListItemIcon>
                    <ListItemText primary="Tableau de bord" />
                </ListItem>
                <ListItem button onClick={() => handleNavigation('/products')}>
                    <ListItemIcon><ProductIcon /></ListItemIcon>
                    <ListItemText primary="Produits" />
                </ListItem>
                <ListItem button onClick={() => handleNavigation('/users')}>
                    <ListItemIcon><UserIcon /></ListItemIcon>
                    <ListItemText primary="Utilisateurs" />
                </ListItem>
                <ListItem button onClick={() => handleNavigation('/orders')}>
                    <ListItemIcon><OrderIcon /></ListItemIcon>
                    <ListItemText primary="Commandes" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Déconnexion" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;
