import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductDetailPage from '../../src/pages/ProductDetailPage';
import ProductListPage from '../../src/pages/ProductListPage';
import { AuthProvider } from '../../src/contexts/AuthContext';

// Mock services
jest.mock('../../src/services/productService', () => ({
  fetchProductDetails: jest.fn(() => Promise.resolve({
    _id: '1',
    name: 'Chicha Premium',
    description: 'Une chicha de haute qualité',
    price: 150,
    imageUrl: '/image.jpg',
    category: 'Chichas'
  })),
  fetchProducts: jest.fn(() => Promise.resolve([
    {
      _id: '1',
      name: 'Chicha Premium',
      price: 150,
      imageUrl: '/image1.jpg',
      category: 'Chichas'
    },
    {
      _id: '2',
      name: 'Accessoire Deluxe',
      price: 50,
      imageUrl: '/image2.jpg',
      category: 'Accessoires'
    }
  ]))
}));

describe('Product Features Integration', () => {
  test('Product List Page renders and filters work', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductListPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Chicha Premium')).toBeInTheDocument();
      expect(screen.getByText('Accessoire Deluxe')).toBeInTheDocument();
    });

    // Test category filter
    const categoryFilter = screen.getByLabelText('Chichas');
    fireEvent.click(categoryFilter);

    await waitFor(() => {
      expect(screen.getByText('Chicha Premium')).toBeInTheDocument();
      expect(screen.queryByText('Accessoire Deluxe')).not.toBeInTheDocument();
    });
  });

  test('Product Detail Page shows recommendations and reviews', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductDetailPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for product details to load
    await waitFor(() => {
      expect(screen.getByText('Chicha Premium')).toBeInTheDocument();
      expect(screen.getByText('Une chicha de haute qualité')).toBeInTheDocument();
    });

    // Check for recommendation and review sections
    expect(screen.getByText('Produits Recommandés')).toBeInTheDocument();
    expect(screen.getByText('Avis Clients')).toBeInTheDocument();
  });

  test('Wishlist functionality works', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductListPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      const wishlistButtons = screen.getAllByLabelText(/Ajouter à la wishlist/i);
      expect(wishlistButtons.length).toBeGreaterThan(0);
    });

    // Simulate wishlist button click
    const wishlistButton = screen.getAllByLabelText(/Ajouter à la wishlist/i)[0];
    fireEvent.click(wishlistButton);

    // In a real scenario, this would trigger an API call
    // Here we just check the interaction
    expect(wishlistButton).toHaveClass('in-wishlist');
  });
});
