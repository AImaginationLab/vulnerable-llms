import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Homepage from '../pages/Homepage';

describe('Homepage', () => {
  it('renders main headings', () => {
    render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/AI Security Demonstration Application/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /OWASP LLM Top 10 2025/i })).toBeInTheDocument();
  });
});