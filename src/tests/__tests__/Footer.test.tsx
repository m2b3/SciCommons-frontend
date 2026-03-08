import React from 'react';

import { render, screen } from '@testing-library/react';

import Footer from '@/components/common/Footer';

// Mock the next/link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  const MockImage = ({ alt }: { alt?: string }) => <span aria-label={alt ?? 'image'} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
  });

  it('displays all navigation links', () => {
    render(<Footer />);
    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Updated footer link expectations to exclude Articles.
       Why: Articles is intentionally suppressed from user-facing footer navigation for now.
       How: Removed "Articles" from expected links and added a negative assertion. */
    const links = ['Home', 'Communities', 'About', 'Login', 'Register', 'Docs'];
    links.forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
    expect(screen.queryByText('Articles')).not.toBeInTheDocument();
  });

  it('displays copyright information', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© 2024–${currentYear} SciCommons`)).toBeInTheDocument();
  });

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Removed footer social/policy link assertions.
     Why: The UI intentionally hides these dead links.
     How: Keep coverage to visible content only. */

  it('applies correct CSS classes for light mode', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    /* Fixed by Codex on 2026-02-15
       Who: Codex
       What: Update footer class expectation to match refreshed palette.
       Why: Footer now uses the neutral background token instead of green tint.
       How: Assert the presence of the new background class. */
    expect(footer).toHaveClass('bg-common-background');
  });

  // Note: Testing dark mode might require additional setup or a different approach
  // as it often depends on a theme context or CSS variables
});
