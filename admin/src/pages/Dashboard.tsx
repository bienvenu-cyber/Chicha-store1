import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Grid, 
    Typography, 
    Card, 
    CardContent, 
    Box, 
    CircularProgress, 
    Alert 
} from '@mui/material';
import { 
    AttachMoney as MoneyIcon, 
    ShoppingCart as OrderIcon, 
    Inventory as ProductIcon, 
    People as UserIcon 
} from '@mui/icons-material';
import { apiClient } from '../services/api';

// Composant pour les cartes de statistiques
const StatCard: React.FC<{
    title: string, 
    value: number, 
    icon: React.ReactNode
}> = ({ title, value, icon }) => (
    <Card>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="h4">{value}</Typography>
                </Box>
                {icon}
            </Box>
        </CardContent>
    </Card>
);

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                const [
                    revenueResponse, 
                    ordersResponse, 
                    productsResponse, 
                    usersResponse
                ] = await Promise.all([
                    apiClient.get('/dashboard/revenue'),
                    apiClient.get('/dashboard/orders'),
                    apiClient.get('/dashboard/products'),
                    apiClient.get('/dashboard/users')
                ]);

                setStats({
                    totalRevenue: revenueResponse.data.total,
                    totalOrders: ordersResponse.data.total,
                    totalProducts: productsResponse.data.total,
                    totalUsers: usersResponse.data.total
                });
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques', error);
                setError('Impossible de charger les statistiques.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 4 }}>
                    Tableau de Bord
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 4 }}>
                    Tableau de Bord
                </Typography>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 4 }}>
                Tableau de Bord
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Chiffre d'Affaires" 
                        value={stats.totalRevenue} 
                        icon={<MoneyIcon color="primary" />} 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Commandes" 
                        value={stats.totalOrders} 
                        icon={<OrderIcon color="secondary" />} 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Produits" 
                        value={stats.totalProducts} 
                        icon={<ProductIcon color="success" />} 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Utilisateurs" 
                        value={stats.totalUsers} 
                        icon={<UserIcon color="warning" />} 
                    />
                </Grid>
            </Grid>

            {/* Ici, on pourrait ajouter des graphiques ou des tableaux plus détaillés */}
        </Container>
    );
};

export default Dashboard;
