import React from 'react';

import { render, screen } from '@testing-library/react';

import Footer from '@/components/Footer';

// Mock the next/link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
  });

  it('displays all navigation links', () => {
    render(<Footer />);
    const links = ['Home', 'Articles', 'Communities', 'Posts', 'About', 'Login', 'Register'];
    links.forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it('displays social media icons', () => {
    render(<Footer />);
    const socialMediaPlatforms = ['Facebook', 'Youtube', 'Instagram', 'Twitter'];
    socialMediaPlatforms.forEach((platform) => {
      expect(screen.getByText(platform, { selector: 'span' })).toBeInTheDocument();
    });
  });

  it('displays copyright information', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2023 SciCommons. All rights reserved./)).toBeInTheDocument();
  });

  it('displays Terms and Conditions link', () => {
    render(<Footer />);
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
  });

  it('displays Privacy Policy link', () => {
    render(<Footer />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('applies correct CSS classes for light mode', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-gray-200');
  });

  // Note: Testing dark mode might require additional setup or a different approach
  // as it often depends on a theme context or CSS variables
});
