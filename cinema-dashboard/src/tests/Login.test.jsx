import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

// Mocks
vi.mock('axios');

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('Debe renderizar el título y los campos del formulario', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText('CINEMA ADMIN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@cinema.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar al Sistema/i })).toBeInTheDocument();
  });

  it('Debe actualizar los inputs al escribir', () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText('admin@cinema.com');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    expect(emailInput.value).toBe('test@test.com');
  });
});
