import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { NotificationProvider } from './contexts/NotificationContext';

// Partially mock react-router-dom
vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom') as any;
  return {
    ...original,
    BrowserRouter: original.BrowserRouter,
    Routes: original.Routes,
    Route: original.Route,
  };
});

// Partially mock react-redux
vi.mock('react-redux', async () => {
  const original = await vi.importActual('react-redux') as any;
  return {
    ...original,
    Provider: ({ children }: { children: React.ReactNode }) => children,
    useSelector: () => ({}),
    useDispatch: () => vi.fn(),
  };
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={{}}>
      <NotificationProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
};

describe('App Component', () => {
  test('renders app and checks main navigation', () => {
    renderWithProviders(<App />);
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
});
