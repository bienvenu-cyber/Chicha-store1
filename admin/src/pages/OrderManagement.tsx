import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Pagination
} from '@mui/material';
import { 
    Visibility as VisibilityIcon,
    DateRange as DateRangeIcon 
} from '@mui/icons-material';
import { orderService } from '../services/orderService';
import { Order } from '../types/Order';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [openReportDialog, setOpenReportDialog] = useState(false);
    const [reportStartDate, setReportStartDate] = useState<Date | null>(null);
    const [reportEndDate, setReportEndDate] = useState<Date | null>(null);
    const [salesReport, setSalesReport] = useState<any>(null);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const ordersPerPage = 10; // Adjust per your needs

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        setError(null);
        try {
            const data = await orderService.getAll(page, ordersPerPage);
            setOrders(data);
        } catch (error) {
            setError('Erreur lors du chargement des commandes');
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleViewOrder = async (order: Order) => {
        try {
            const fullOrder = await orderService.getById(order._id);
            setSelectedOrder(fullOrder);
            setOpenOrderDialog(true);
        } catch (error) {
            setError('Erreur lors du chargement des détails de la commande');
        }
    };

    const handleUpdateOrderStatus = async (status: Order['status']) => {
        if (selectedOrder) {
            try {
                await orderService.updateStatus(selectedOrder._id, status);
                fetchOrders();
                setOpenOrderDialog(false);
            } catch (error) {
                setError('Erreur lors de la mise à jour du statut');
            }
        }
    };

    const handleGenerateReport = async () => {
        if (reportStartDate && reportEndDate) {
            if (reportStartDate > reportEndDate) {
                setError('La date de début doit être antérieure à la date de fin');
                return;
            }
            setLoadingReport(true);
            setError(null);
            try {
                const report = await orderService.getSalesReport(
                    reportStartDate.toISOString(), 
                    reportEndDate.toISOString()
                );
                setSalesReport(report);
            } catch (error) {
                setError('Erreur lors de la génération du rapport');
            } finally {
                setLoadingReport(false);
            }
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 4 }}>
                    Gestion des Commandes
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <Button 
                    variant="contained" 
                    startIcon={<DateRangeIcon />} 
                    onClick={() => setOpenReportDialog(true)}
                    sx={{ mb: 2, mr: 2 }}
                >
                    Générer Rapport de Ventes
                </Button>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID Commande</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingOrders ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell>{order._id}</TableCell>
                                        <TableCell>{order.user}</TableCell>
                                        <TableCell>{order.total} €</TableCell>
                                        <TableCell>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={order.status} 
                                                color={getStatusColor(order.status)} 
                                                size="small" 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                startIcon={<VisibilityIcon />} 
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                Détails
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Pagination
                    count={Math.ceil(100 / ordersPerPage)} // Update count based on total orders
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    sx={{ mt: 2 }}
                />

                {/* Dialog Détails Commande */}
                <Dialog 
                    open={openOrderDialog} 
                    onClose={() => setOpenOrderDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Détails de la Commande</DialogTitle>
                    <DialogContent>
                        {selectedOrder && (
                            <>
                                <Typography variant="h6">
                                    Commande #{selectedOrder._id}
                                </Typography>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Statut de la Commande</InputLabel>
                                    <Select
                                        value={selectedOrder.status}
                                        label="Statut de la Commande"
                                        onChange={(e) => handleUpdateOrderStatus(e.target.value as Order['status'])}
                                    >
                                        <MenuItem value="pending">En attente</MenuItem>
                                        <MenuItem value="processing">En cours</MenuItem>
                                        <MenuItem value="shipped">Expédiée</MenuItem>
                                        <MenuItem value="delivered">Livrée</MenuItem>
                                        <MenuItem value="cancelled">Annulée</MenuItem>
                                    </Select>
                                </FormControl>

                                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                    Produits :
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Produit</TableCell>
                                            <TableCell>Quantité</TableCell>
                                            <TableCell>Prix</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedOrder.products.map((item) => (
                                            <TableRow key={item.product}>
                                                <TableCell>{item.product}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{item.price} €</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                    Adresse de Livraison :
                                </Typography>
                                <Typography>
                                    {selectedOrder.shippingAddress.street}<br />
                                    {selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}<br />
                                    {selectedOrder.shippingAddress.country}
                                </Typography>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenOrderDialog(false)}>Fermer</Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Rapport de Ventes */}
                <Dialog 
                    open={openReportDialog} 
                    onClose={() => setOpenReportDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Générer un Rapport de Ventes</DialogTitle>
                    <DialogContent>
                        <DatePicker
                            label="Date de début"
                            value={reportStartDate}
                            onChange={(date) => setReportStartDate(date)}
                            sx={{ width: '100%', mb: 2 }}
                        />
                        <DatePicker
                            label="Date de fin"
                            value={reportEndDate}
                            onChange={(date) => setReportEndDate(date)}
                            sx={{ width: '100%', mb: 2 }}
                        />
                        <Button 
                            variant="contained" 
                            onClick={handleGenerateReport}
                            disabled={!reportStartDate || !reportEndDate || loadingReport}
                        >
                            {loadingReport ? <CircularProgress size={24} /> : 'Générer le Rapport'}
                        </Button>

                        {salesReport && (
                            <Paper sx={{ mt: 2, p: 2 }}>
                                <Typography variant="h6">Rapport de Ventes</Typography>
                                <Typography>Chiffre d'affaires total : {salesReport.totalRevenue} €</Typography>
                                <Typography>Nombre de commandes : {salesReport.totalOrders}</Typography>
                                <Typography>Produit le plus vendu : {salesReport.topProduct}</Typography>
                            </Paper>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenReportDialog(false)}>Fermer</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </LocalizationProvider>
    );
};

export default OrderManagement;
