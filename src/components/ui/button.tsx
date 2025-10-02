/* eslint-disable react/display-name */
import * as React from 'react';

import Image from 'next/image';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { Oval } from 'react-loader-spinner';

import { cn } from '@/lib/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap gap-2 select-none text-white transition-all duration-100 ease-in-out rounded-md w-fit px-3 py-2 h-fit',
  {
    variants: {
      variant: {
        default: 'bg-functional-green hover:bg-functional-greenContrast',
        danger: 'bg-functional-red hover:bg-functional-redContrast',
        blue: 'bg-functional-blue hover:bg-functional-blueContrast',
        gray: 'bg-functional-gray hover:bg-functional-grayContrast text-black dark:text-white',
        transparent: 'bg-transparent hover:bg-transparent dark:text-white text-black',
        outline:
          'bg-transparent border border-common-minimal text-text-primary hover:bg-common-minimal/20',
        inverted: 'bg-white text-black dark:bg-black dark:text-white',
      },
      size: {
        default: 'text-base',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      },
      loading: {
        true: 'opacity-50 cursor-not-allowed hover:shadow-none',
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

export type ButtonProps =
  | ({
      withTooltip: true;
      tooltipData: React.ReactNode;
      asChild?: boolean;
      loading?: boolean;
      showLoadingSpinner?: boolean;
      children?: React.ReactNode;
      disabled?: boolean;
      loaderColor?: string;
    } & Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>,
      | 'withTooltip'
      | 'tooltipData'
      | 'asChild'
      | 'loading'
      | 'showLoadingSpinner'
      | 'children'
      | 'disabled'
      | 'loaderColor'
    >)
  | ({
      withTooltip?: false | undefined;
      tooltipData?: never;
      asChild?: boolean;
      loading?: boolean;
      showLoadingSpinner?: boolean;
      children?: React.ReactNode;
      disabled?: boolean;
      loaderColor?: string;
    } & Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>,
      | 'withTooltip'
      | 'tooltipData'
      | 'asChild'
      | 'loading'
      | 'showLoadingSpinner'
      | 'children'
      | 'disabled'
      | 'loaderColor'
    >);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      showLoadingSpinner = false,
      disabled,
      loaderColor = '#fff',
      asChild = false,
      children,
      onClick,
      withTooltip = false,
      tooltipData,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }
      if (onClick) {
        onClick(event);
      }
    };

    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, disabled, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        <div className="relative flex items-center justify-center">
          {loading && showLoadingSpinner && (
            <Oval
              height={16}
              width={16}
              color={loaderColor}
              wrapperStyle={{}}
              wrapperClass="absolute"
              visible={true}
              ariaLabel="oval-loading"
              secondaryColor="#fff"
              strokeWidth={6}
              strokeWidthSecondary={6}
            />
          )}
          <span
            className={cn('flex items-center gap-2', {
              invisible: loading && showLoadingSpinner,
              visible: !loading || !showLoadingSpinner,
            })}
          >
            {children}
          </span>
        </div>
      </Comp>
    );

    if (withTooltip && tooltipData && String(tooltipData).trim() !== '') {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="px-2">
            {tooltipData}
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonElement;
  }
);

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
        'flex items-center justify-center whitespace-nowrap text-xxs font-normal sm:text-xs',
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
