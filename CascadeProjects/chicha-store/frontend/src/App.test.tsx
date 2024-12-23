import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};

test('renders app and checks main navigation', () => {
  renderWithProviders(<App />);
  
  // Vérifier la présence des éléments de navigation principaux
  expect(screen.getByText(/Chicha Store/i)).toBeInTheDocument();
  expect(screen.getByText(/Produits/i)).toBeInTheDocument();
});

test('checks routing configuration', () => {
  renderWithProviders(<App />);
  
  // Vérifier que les routes de base existent
  const routes = [
    { path: '/', name: 'Accueil' },
    { path: '/products', name: 'Produits' },
    { path: '/login', name: 'Connexion' },
    { path: '/cart', name: 'Panier' }
  ];

  routes.forEach(route => {
    // Cette vérification est plus conceptuelle, car les routes ne sont pas réellement rendues
    expect(screen.getByText(new RegExp(route.name, 'i'))).toBeInTheDocument();
  });
});

test('checks cart functionality', () => {
  renderWithProviders(<App />);
  
  // Vérifier l'existence du bouton du panier
  const cartButton = screen.getByRole('button', { name: /panier/i });
  expect(cartButton).toBeInTheDocument();
});
