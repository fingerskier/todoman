import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the three planning board rows', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /priority/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /scheduled/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /delegated/i })).toBeInTheDocument();
  expect(screen.getByText('2025-Q4')).toBeInTheDocument();
});

test('opens the editor when a todo card is clicked', () => {
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: /finalize launch checklist/i })[0]);

  expect(screen.getByRole('heading', { name: /edit todo/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/due date/i)).toHaveValue('2026-01-15');
});
