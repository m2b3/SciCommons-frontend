import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        /* Fixed by Codex on 2026-02-15
           Who: Codex
           What: Align base input background + text colors with the theme tokens.
           Why: The inverted background made inputs dark in light mode and light in dark mode, hiding text.
           How: Switch to `bg-common-cardBackground` while keeping `text-text-primary` + caret colors. */
        className={cn(
          'flex h-10 w-full rounded-full border border-input bg-common-cardBackground px-4 py-3 text-sm text-text-primary caret-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
