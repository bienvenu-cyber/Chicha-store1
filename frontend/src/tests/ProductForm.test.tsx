import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductForm from '../components/ProductForm';
import { createProduct, updateProduct } from '../services/productService';
import { NotificationProvider } from '../contexts/NotificationContext';
import { Provider } from 'react-redux';

// Mock des dépendances
vi.mock('../services/productService', () => ({
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

// Mock du contexte de notification
vi.mock('../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
  useNotification: () => ({
    showNotification: vi.fn(),
  }),
}));

// Mock du store Redux
const mockStore = {
  getState: () => ({}),
  subscribe: () => {},
  dispatch: vi.fn(),
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <NotificationProvider>
        {ui}
      </NotificationProvider>
    </Provider>
  );
};

describe('ProductForm', () => {
  const mockProduct = {
    id: 'test-product',
    name: 'Chicha Pro',
    description: 'Une chicha de haute qualité',
    price: 199.99,
    category: 'chicha',
    stock: 5,
    imageUrl: 'http://test.com/chicha.jpg',
    specifications: {
      height: 50,
      material: 'Inox',
      color: 'Noir'
    }
  };

  it('renders create form correctly', () => {
    renderWithProviders(<ProductForm />);

    expect(screen.getByText(/Ajouter un Produit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom du Produit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prix/i)).toBeInTheDocument();
  });

  it('renders update form with existing product data', () => {
    renderWithProviders(<ProductForm product={mockProduct} />);

    expect(screen.getByText(/Modifier un Produit/i)).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/Nom du Produit/i) as HTMLInputElement;
    expect(nameInput.value).toBe(mockProduct.name);
  });

  it('creates a new product successfully', async () => {
    const mockOnSubmitSuccess = vi.fn();
    (createProduct as any).mockResolvedValue(mockProduct);

    renderWithProviders(
      <ProductForm onSubmitSuccess={mockOnSubmitSuccess} />
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Nom du Produit/i), { 
      target: { value: mockProduct.name } 
    });
    fireEvent.change(screen.getByLabelText(/Prix/i), { 
      target: { value: mockProduct.price.toString() } 
    });
    fireEvent.change(screen.getByLabelText(/Stock/i), { 
      target: { value: mockProduct.stock.toString() } 
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByText(/Créer/i));

    await waitFor(() => {
      expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({
        name: mockProduct.name,
        price: mockProduct.price,
        stock: mockProduct.stock
      }));
      expect(mockOnSubmitSuccess).toHaveBeenCalled();
    });
  });

  it('updates an existing product successfully', async () => {
    const mockOnSubmitSuccess = vi.fn();
    (updateProduct as any).mockResolvedValue(mockProduct);

    renderWithProviders(
      <ProductForm 
        product={mockProduct} 
        onSubmitSuccess={mockOnSubmitSuccess} 
      />
    );

    // Modifier un champ
    fireEvent.change(screen.getByLabelText(/Nom du Produit/i), { 
      target: { value: 'Nouveau Nom' } 
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByText(/Mettre à jour/i));

    await waitFor(() => {
      expect(updateProduct).toHaveBeenCalledWith(
        mockProduct.id, 
        expect.objectContaining({
          name: 'Nouveau Nom'
        })
      );
      expect(mockOnSubmitSuccess).toHaveBeenCalled();
    });
  });

  it('handles form validation', async () => {
    renderWithProviders(<ProductForm />);

    // Soumettre un formulaire vide
    fireEvent.click(screen.getByText(/Créer/i));

    // Vérifier les validations
    await waitFor(() => {
      expect(screen.getByText(/Nom du Produit/i)).toBeInTheDocument();
      expect(screen.getByText(/Prix/i)).toBeInTheDocument();
    });
  });
});
