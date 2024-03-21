import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../Footer';
import React from 'react';

describe('Footer Component', () => {
  test('renders the logo image', () => {
    render(<Footer />);
    const logoImage = screen.getByRole('img');
    expect(logoImage).toHaveAttribute('src', expect.stringContaining('/logo.png'));
    expect(logoImage).toHaveAttribute('alt', '');
  });

  test('renders the subscription prompt', () => {
    render(<Footer />);
    expect(screen.getByText(/Join 31,000\+ other and never miss out on new tips, tutorials, and more\./i)).toBeInTheDocument();
  });

  test('renders social links', () => {
    render(<Footer />);
    expect(screen.getByLabelText(/Reddit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Facebook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Github/i)).toBeInTheDocument();
  });

  test('renders the copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© SciCommons - All rights reserved/i)).toBeInTheDocument();
  });
});
