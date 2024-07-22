/* eslint-disable react/display-name */
import * as React from 'react';

import Image from 'next/image';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { Oval } from 'react-loader-spinner';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap gap-2 select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white border-none',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        affilinks: 'bg-green text-white border-none',
        igcash: 'bg-hotPink text-white border-none',
        topsecrets: 'bg-yellow text-black border-none',
        cwf: 'bg-consultme-purple-500 text-white border-none',
        vibe: 'bg-vibePink text-white border-none',
        job_board: ' bg-team-blue-primary text-white border-none',
      },
      size: {
        default: 'px-3 py-2 text-base rounded-lg',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
      loading: {
        true: 'bg-gray-400 cursor-not-allowed hover:shadow-none',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50 hover:underline-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      loading: false,
      disabled: false,
    },
  }
);

/**
 * TypeScript React component for a customizable button with various styles, sizes, loading states,
 * and disabled states.
 * Pass the product name as variant to render the button in the respective color.
 * Pass the size prop to render the button in the respective size.
 * @param {ButtonProps} props - Properties for the Button component.
 * @param {string} className - CSS classes for custom styling.
 * @param {string} variant - Specifies variant: 'affilinks', 'igcash', 'topsecrets', 'cwf', or 'vibe'.
 * default variant is can be use for 'dashboard' and 'ytcash'.
 * @param {string} size - Specifies size: 'sm', 'lg', or 'icon'.
 * @param {boolean} loading - Shows loading spinner.
 * @param {boolean} disabled - Disables the button.
 * @param {boolean} asChild - Renders as a child component.
 * @param {React.ReactNode} children - Content inside the Button.
 * @returns {JSX.Element} - Rendered Button component.
 **/

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  loaderColor?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      disabled,
      loaderColor = '#fff',
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, disabled, className }))}
        ref={ref}
        {...props}
      >
        {loading ? (
          <Oval
            height={16}
            width={16}
            color={loaderColor}
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#fff"
            strokeWidth={6}
            strokeWidthSecondary={6}
          />
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

/**
 * TypeScript React component for a button with customizable title text.
 * Either pass the text as children or the react element as children.
 * @property {React.ReactNode} children - Button title text.
 * @property {string} className - CSS classes for custom styling.
 */
type ButtonTitleProps = {
  children: React.ReactNode;
  className?: string;
};

const ButtonTitle = React.forwardRef<HTMLDivElement, ButtonTitleProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center font-semibold leading-6 tracking-wide',
        className
      )}
    >
      {children}
    </div>
  )
);

/**
 * TypeScript React component for a button icon, either an image or a div with optional children.
 * Pass in the src prop to render an image, or children to render a div with children.
 * With src prop, pass the image height, width, and optional className.
 * With children prop, pass the optional className.
 * @param {ButtonIconProps} props - Properties for the ButtonIcon component.
 * @param {string} src - Image source.
 * @param {string} className - CSS classes for custom styling.
 * @param {string | number} height - Height of the icon.
 * @param {string | number} width - Width of the icon.
 */
type ButtonIconProps = {
  src?: string;
  className?: string;
  height?: number;
  width?: number;
  children?: React.ReactNode;
};

const ButtonIcon = React.forwardRef<HTMLImageElement | HTMLDivElement, ButtonIconProps>(
  ({ src, className, height, width, children }, ref) => {
    if (src) {
      return <Image src={src} alt="icon" height={height} width={width} className={className} />;
    } else {
      return (
        <div
          ref={ref as React.MutableRefObject<HTMLDivElement>}
          className={cn('flex items-center justify-center', className)}
        >
          {children}
        </div>
      );
    }
  }
);

export { Button, ButtonIcon, ButtonTitle, buttonVariants };
