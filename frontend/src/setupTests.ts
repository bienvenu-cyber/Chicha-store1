// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Configurer les mocks globaux si nécessaire
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => children,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}));

// Ajouter d'autres configurations de test globales si nécessaire
vi.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => children,
  useSelector: () => ({}),
  useDispatch: () => vi.fn(),
}));
