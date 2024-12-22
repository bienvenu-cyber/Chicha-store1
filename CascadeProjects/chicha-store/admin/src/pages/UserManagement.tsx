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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { User, UserRole } from '../types/User';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User>>({
        name: '',
        email: '',
        role: 'user' as UserRole,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [userOrders, setUserOrders] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs', error);
        }
    };

    const handleOpenDialog = async (user?: User) => {
        if (user) {
            try {
                // Récupérer les commandes de l'utilisateur
                const orders = await userService.getUserOrders(user._id!);
                setUserOrders(orders);

                setCurrentUser(user);
                setIsEditing(true);
            } catch (error) {
                console.error('Erreur lors du chargement des commandes', error);
            }
        } else {
            setCurrentUser({
                name: '',
                email: '',
                role: 'user' as UserRole,
            });
            setIsEditing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentUser({
            name: '',
            email: '',
            role: 'user' as UserRole,
        });
        setUserOrders([]);
    };

    const handleSaveUser = async () => {
        try {
            if (isEditing && currentUser._id) {
                await userService.update(currentUser._id, currentUser);
            } else {
                await userService.create(currentUser as User);
            }
            fetchUsers();
            handleCloseDialog();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'utilisateur', error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await userService.delete(id);
            fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur', error);
        }
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 4 }}>
                Gestion des Utilisateurs
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rôle</TableCell>
                            <TableCell>Date de création</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenDialog(user)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteUser(user._id!)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Détails de l'Utilisateur
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Nom"
                        fullWidth
                        value={currentUser.name || ''}
                        onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                        disabled={isEditing}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        fullWidth
                        value={currentUser.email || ''}
                        onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                        disabled={isEditing}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Rôle</InputLabel>
                        <Select
                            value={currentUser.role || 'user'}
                            label="Rôle"
                            onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as UserRole})}
                        >
                            <MenuItem value="user">Utilisateur</MenuItem>
                            <MenuItem value="admin">Administrateur</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Section des commandes */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Historique des Commandes
                    </Typography>
                    {userOrders.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID Commande</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Montant</TableCell>
                                        <TableCell>Statut</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userOrders.map((order: any) => (
                                        <TableRow key={order._id}>
                                            <TableCell>{order._id}</TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{order.total} €</TableCell>
                                            <TableCell>{order.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography>Aucune commande</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Fermer</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserManagement;
