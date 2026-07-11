import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

function createDataTransfer() {
  const store = {};
  return {
    effectAllowed: '',
    setData: (type, value) => {
      store[type] = value;
    },
    getData: (type) => store[type] || '',
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

test('renders the three planning board rows', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /priority/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /^scheduled$/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /delegated/i })).toBeInTheDocument();
  expect(screen.getByText('2025-Q4')).toBeInTheDocument();
});

test('opens the editor when a todo card is clicked', () => {
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: /finalize launch checklist/i })[0]);

  expect(screen.getByRole('heading', { name: /edit todo/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/due date/i)).toHaveValue('2026-01-15');
});

test('dropping a card on a delegated column applies the target owner', () => {
  render(<App />);

  const dataTransfer = createDataTransfer();
  const card = screen.getAllByRole('button', { name: /draft customer update/i })[0];
  fireEvent.dragStart(card, { dataTransfer });

  const alexColumn = screen.getByRole('heading', { name: 'Alex' }).closest('.board-column');
  fireEvent.drop(alexColumn, { dataTransfer });

  // The editor opens pre-filled with the dropped column's owner...
  expect(screen.getByLabelText(/owner/i)).toHaveValue('Alex');

  // ...so saving unchanged actually commits the move.
  fireEvent.click(screen.getByRole('button', { name: /save todo/i }));

  const updatedAlexColumn = screen.getByRole('heading', { name: 'Alex' }).closest('.board-column');
  expect(within(updatedAlexColumn).getByText(/draft customer update/i)).toBeInTheDocument();
});

test('persists edits across reloads via localStorage', () => {
  const { unmount } = render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: /finalize launch checklist/i })[0]);
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'Finalize launch checklist v2' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save todo/i }));

  expect(screen.getAllByRole('button', { name: /finalize launch checklist v2/i })[0]).toBeInTheDocument();

  unmount();
  render(<App />);

  expect(screen.getAllByRole('button', { name: /finalize launch checklist v2/i })[0]).toBeInTheDocument();
});


test('adds a new todo item', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /add todo/i }));
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Review beta feedback' } });
  fireEvent.change(screen.getByLabelText(/owner/i), { target: { value: 'Alex' } });
  fireEvent.click(screen.getByRole('button', { name: /save todo/i }));

  expect(screen.getAllByRole('button', { name: /review beta feedback/i })[0]).toBeInTheDocument();
});

test('deletes an existing todo item', () => {
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: /finalize launch checklist/i })[0]);
  fireEvent.click(screen.getByRole('button', { name: /delete todo/i }));

  expect(screen.queryByRole('button', { name: /finalize launch checklist/i })).not.toBeInTheDocument();
});

test('configures columns for a board row', () => {
  render(<App />);

  const priorityRow = screen.getByLabelText(/priority board row/i);
  fireEvent.click(within(priorityRow).getByRole('button', { name: /configure columns/i }));
  fireEvent.change(screen.getByPlaceholderText(/example: blocked/i), { target: { value: 'Blocked' } });
  fireEvent.click(screen.getByRole('button', { name: /^add column$/i }));
  fireEvent.click(screen.getByLabelText(/close column configurator/i));

  expect(screen.getByRole('heading', { name: 'Blocked' })).toBeInTheDocument();
});
