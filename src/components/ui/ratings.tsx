import React from 'react';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

const ratingVariants = {
  default: {
    star: 'text-text-primary',
    emptyStar: 'text-text-tertiary',
  },
  destructive: {
    star: 'text-functional-red',
    emptyStar: 'text-functional-red',
  },
  yellow: {
    star: 'text-functional-yellow',
    emptyStar: 'text-functional-yellow',
  },
};

interface RatingsProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  totalStars?: number;
  size?: number;
  fill?: boolean;
  Icon?: React.ReactElement;
  variant?: keyof typeof ratingVariants;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

const Ratings = ({
  rating,
  totalStars = 5,
  size = 20,
  fill = true,
  Icon = <Star />,
  variant = 'default',
  readonly = true,
  onRatingChange,
  ...props
}: RatingsProps) => {
  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index);
    }
  };

  const fullStars = Math.floor(rating);
  const partialStar =
    rating % 1 > 0 ? (
      <PartialStar
        fillPercentage={rating % 1}
        size={size}
        className={cn(ratingVariants[variant].star)}
        Icon={Icon}
      />
    ) : null;

  return (
    <div className={cn('flex h-fit items-center gap-1')} {...props}>
      {[...Array(fullStars)].map((_, i) =>
        React.cloneElement(Icon, {
          key: i,
          size,
          className: cn(fill ? 'fill-current' : 'fill-transparent', ratingVariants[variant].star),
          onClick: () => handleClick(i + 1),
          style: { cursor: readonly ? 'default' : 'pointer' },
        })
      )}
      {partialStar}
      {[...Array(totalStars - fullStars - (partialStar ? 1 : 0))].map((_, i) =>
        React.cloneElement(Icon, {
          key: i + fullStars + 1,
          size,
          className: cn(ratingVariants[variant].emptyStar),
          onClick: () => handleClick(i + fullStars + 1),
          style: { cursor: readonly ? 'default' : 'pointer' },
        })
      )}
    </div>
  );
};

interface PartialStarProps {
  fillPercentage: number;
  size: number;
  className?: string;
  Icon: React.ReactElement;
}

const PartialStar = ({ fillPercentage, size, className, Icon }: PartialStarProps) => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    {React.cloneElement(Icon, {
      size,
      className: cn('fill-current', className),
    })}
    <div
      style={{
        position: 'absolute',
        top: 0,
        overflow: 'hidden',
        width: `${fillPercentage * 100}%`,
      }}
    >
      {React.cloneElement(Icon, {
        size,
        className: cn('fill-current', className),
      })}
    </div>
  </div>
);

export { Ratings };
