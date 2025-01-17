import React from 'react';
import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    Divider 
} from '@mui/material';
import { 
    Dashboard as DashboardIcon, 
    Inventory as ProductIcon, 
    People as UserIcon, 
    ShoppingCart as OrderIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();  // To track the current route

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Produits', icon: <ProductIcon />, path: '/products' },
        { text: 'Utilisateurs', icon: <UserIcon />, path: '/users' },
        { text: 'Commandes', icon: <OrderIcon />, path: '/orders' },
    ];

    const isActive = (path: string) => location.pathname === path;

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
                {navItems.map((item) => (
                    <ListItem 
                        button 
                        key={item.text} 
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                            backgroundColor: isActive(item.path) ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <Divider />
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Déconnexion" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;

