import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AdminArticleEditorPage from './pages/AdminArticleEditorPage';
import ArticleAnalyticsDashboard from './pages/ArticleAnalyticsDashboard';
import AdminAnalyticsArchivePage from './pages/AdminAnalyticsArchivePage';
import CustomAnalyticsReportPage from './pages/CustomAnalyticsReportPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B4513', // Marron riche pour l'ambiance chicha
    },
    secondary: {
      main: '#D2691E', // Nuance de marron complémentaire
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
            <Route 
              path="/admin/articles/new" 
              element={
                <PrivateRoute adminOnly>
                  <AdminArticleEditorPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/articles/:id/edit" 
              element={
                <PrivateRoute adminOnly>
                  <AdminArticleEditorPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/article-analytics" 
              element={
                <PrivateRoute adminOnly>
                  <ArticleAnalyticsDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/analytics-archives" 
              element={
                <PrivateRoute adminOnly>
                  <AdminAnalyticsArchivePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/analytics-reports" 
              element={
                <PrivateRoute adminOnly>
                  <CustomAnalyticsReportPage />
                </PrivateRoute>
              } 
            />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
