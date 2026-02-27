import React from 'react';

import clsx from 'clsx';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  isPending?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = 'submit',
  isPending = false,
  onClick,
  children,
}) => {
  return (
    <button
      type={type}
      className={clsx(
        /* Fixed by Codex on 2026-02-15
           Who: Codex
           What: Tokenize common button foreground and focus ring.
           Why: Keep shared button styling aligned with UI skins.
           How: Replace hard-coded white/indigo utilities with semantic tokens. */
        'flex w-full justify-center rounded-md border border-transparent bg-brand px-4 py-2 font-medium text-primary-foreground shadow-sm res-text-sm focus:outline-none focus:ring-2 focus:ring-functional-green focus:ring-offset-2',
        {
          'hover:bg-brand-dark': !isPending,
          'cursor-not-allowed opacity-50': isPending,
        }
      )}
      onClick={onClick}
      disabled={isPending}
    >
      {isPending ? 'Loading...' : children}
    </button>
  );
};

export default Button;
