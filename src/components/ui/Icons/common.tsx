import React from 'react';

import {
  IconArrowNarrowLeft,
  IconBrandFacebookFilled,
  IconBrandInstagramFilled,
  IconBrandTwitterFilled,
  IconBrandYoutubeFilled,
  IconChevronLeft,
  type IconProps as TablerIconProps,
} from '@tabler/icons-react';

import { cn } from '@/lib/utils';

const defaultClasses = 'text-lg';
const defaultStrokeWidth = 1.5;

type IconProps = TablerIconProps;

/**
 * A IconComponent component that wraps an Icon component with default props.
 * @param {React.ComponentType} Icon - The icon component to be wrapped.
 * @return {React.FC} A new functional component with merged props */

export function IconComponent(Icon: React.ComponentType<IconProps>): React.FC<IconProps> {
  // NOTE(bsureshkrishna, 2026-02-09): Tabler icons' ref typing differs from SVG refs,
  // so we wrap without forwarding ref to keep the types compatible.
  const WrappedIcon: React.FC<IconProps> = ({
    className,
    strokeWidth = defaultStrokeWidth,
    ...props
  }) => <Icon className={cn(defaultClasses, className)} strokeWidth={strokeWidth} {...props} />;

  WrappedIcon.displayName = `IconComponent(${Icon.displayName || Icon.name || 'Icon'})`;
  return WrappedIcon;
}

export const FacebookIconFilled = IconComponent(IconBrandFacebookFilled);
export const InstagramIconFilled = IconComponent(IconBrandInstagramFilled);
export const TwitterIconFilled = IconComponent(IconBrandTwitterFilled);
export const YoutubeIconFilled = IconComponent(IconBrandYoutubeFilled);
export const ChevronBack = IconComponent(IconChevronLeft);
export const ArrowNarrowLeft = IconComponent(IconArrowNarrowLeft);
