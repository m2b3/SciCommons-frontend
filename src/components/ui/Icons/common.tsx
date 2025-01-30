import React from 'react';

import {
  IconArrowNarrowLeft,
  IconBrandFacebookFilled,
  IconBrandInstagramFilled,
  IconBrandTwitterFilled,
  IconBrandYoutubeFilled,
  IconChevronLeft,
} from '@tabler/icons-react';

import { cn } from '@/lib/utils';

const defaultClasses = 'text-lg';
const defaultStrokeWidth = 1.5;

interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  className?: string;
  strokeWidth?: number;
}

/**
 * A IconComponent component that wraps an Icon component with default props.
 * @param {React.ComponentType} Icon - The icon component to be wrapped.
 * @return {React.FC} A new functional component with merged props */

export function IconComponent(
  Icon: React.ComponentType<any>
): React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>> {
  const WrappedIcon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ className, strokeWidth = defaultStrokeWidth, ...props }, ref) => (
      <Icon
        ref={ref}
        className={cn(defaultClasses, className)}
        strokeWidth={strokeWidth}
        {...props}
      />
    )
  );

  WrappedIcon.displayName = `IconComponent(${Icon.displayName || Icon.name || 'Icon'})`;
  return WrappedIcon;
}

export const FacebookIconFilled = IconComponent(IconBrandFacebookFilled);
export const InstagramIconFilled = IconComponent(IconBrandInstagramFilled);
export const TwitterIconFilled = IconComponent(IconBrandTwitterFilled);
export const YoutubeIconFilled = IconComponent(IconBrandYoutubeFilled);
export const ChevronBack = IconComponent(IconChevronLeft);
export const ArrowNarrowLeft = IconComponent(IconArrowNarrowLeft);
