import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SecuritySettings from '../components/SecuritySettings';
import { NotificationProvider } from '../contexts/NotificationContext';
import { Provider } from 'react-redux';

// Partially mock react-redux
vi.mock('react-redux', async () => {
  const original = await vi.importActual('react-redux') as any;
  return {
    ...original,
    useDispatch: () => vi.fn(),
    useSelector: () => ({}),
  };
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={{}}>
      <NotificationProvider>
        {ui}
      </NotificationProvider>
    </Provider>
  );
};

describe('SecuritySettings', () => {
  test('password validation requirements', async () => {
    renderWithProviders(<SecuritySettings />);
    
    const newPasswordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const saveButton = screen.getByRole('button', { name: /enregistrer/i });

    // Test: Mot de passe trop court
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    expect(screen.getByText(/Le mot de passe doit contenir au moins 8 caractères/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Test: Mot de passe sans majuscule
    fireEvent.change(newPasswordInput, { target: { value: 'password123!' } });
    expect(screen.getByText(/Le mot de passe doit contenir au moins une majuscule/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Test: Mot de passe sans caractère spécial
    fireEvent.change(newPasswordInput, { target: { value: 'Password123' } });
    expect(screen.getByText(/Le mot de passe doit contenir au moins un caractère spécial/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Test: Mot de passe sans chiffre
    fireEvent.change(newPasswordInput, { target: { value: 'Password!' } });
    expect(screen.getByText(/Le mot de passe doit contenir au moins un chiffre/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Test: Mots de passe non concordants
    fireEvent.change(newPasswordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
    expect(screen.getByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Test: Mot de passe valide
    fireEvent.change(newPasswordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass123!' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/Le mot de passe doit contenir/i)).not.toBeInTheDocument();
      expect(saveButton).toBeEnabled();
    });
  });
});
