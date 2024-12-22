import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders App component', () => {
  render(<App />);
  // Vous pouvez modifier ce test selon votre application
  const titleElement = screen.getByText(/Tableau de Bord/i);
  expect(titleElement).toBeInTheDocument();
});
