import React from 'react';
import { 
    BrowserRouter as Router, 
    Routes, 
    Route, 
    Navigate 
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Composants
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import UserManagement from './pages/UserManagement';
import OrderManagement from './pages/OrderManagement';

// Services
import { authService } from './services/authService';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2', // Couleur principale
        },
    },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return authService.isAuthenticated() ? 
        (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <main style={{ flexGrow: 1, padding: '20px', marginLeft: '240px' }}>
                    {children}
                </main>
            </div>
        ) : 
        <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route 
                        path="/dashboard" 
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/products" 
                        element={
                            <PrivateRoute>
                                <ProductManagement />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/users" 
                        element={
                            <PrivateRoute>
                                <UserManagement />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/orders" 
                        element={
                            <PrivateRoute>
                                <OrderManagement />
                            </PrivateRoute>
                        } 
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;
