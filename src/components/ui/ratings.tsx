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
  const isInteractive = !readonly && !!onRatingChange;
  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index);
    }
  };

  const fullStars = Math.floor(rating);
  const roundedRating = Math.round(rating);
  const partialStar =
    rating % 1 > 0 ? (
      <PartialStar
        fillPercentage={rating % 1}
        size={size}
        className={cn(ratingVariants[variant].star)}
        Icon={Icon}
      />
    ) : null;
  const {
    className,
    'aria-label': ariaLabelProp,
    'aria-labelledby': ariaLabelledByProp,
    ...rest
  } = props;
  const fallbackAriaLabel =
    isInteractive && !ariaLabelProp && !ariaLabelledByProp ? 'Rating' : undefined;

  const renderStar = (index: number, isFilled: boolean) => {
    const iconElement = React.cloneElement(Icon, {
      size,
      className: cn(
        isFilled ? (fill ? 'fill-current' : 'fill-transparent') : '',
        isFilled ? ratingVariants[variant].star : ratingVariants[variant].emptyStar
      ),
      'aria-hidden': true,
      focusable: false,
    });

    if (!isInteractive) {
      return <React.Fragment key={index}>{iconElement}</React.Fragment>;
    }

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(index)}
        className="leading-none text-inherit"
        role="radio"
        aria-checked={roundedRating === index}
        aria-label={`Rate ${index} out of ${totalStars}`}
      >
        {iconElement}
      </button>
    );
  };

  return (
    <div
      className={cn('flex h-fit items-center gap-1', isInteractive && 'cursor-pointer', className)}
      role={isInteractive ? 'radiogroup' : undefined}
      aria-label={fallbackAriaLabel || ariaLabelProp}
      aria-labelledby={ariaLabelledByProp}
      {...rest}
    >
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Render interactive ratings as buttons with radio semantics.
          Why: SVG click handlers are not keyboard accessible or announced.
          How: Wrap stars in buttons with aria-checked and labels when interactive. */}
      {[...Array(fullStars)].map((_, i) => renderStar(i + 1, true))}
      {partialStar && <span aria-hidden="true">{partialStar}</span>}
      {[...Array(totalStars - fullStars - (partialStar ? 1 : 0))].map((_, i) =>
        renderStar(i + fullStars + 1, false)
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
      'aria-hidden': true,
      focusable: false,
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
        'aria-hidden': true,
        focusable: false,
      })}
    </div>
  </div>
);

export { Ratings };
