import React from 'react';

export type LoaderType = 'spinner' | 'dots' | 'bar' | 'pulse';

interface LoaderProps {
  type?: LoaderType;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  type = 'spinner',
  color = 'purple',
  size = 'medium',
  text = 'Loading...',
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const loaders = {
    spinner: (
      <div
        className={`${sizeClasses[size]} border-4 border-${color}-200 border-t-${color}-700 animate-spin rounded-full`}
      ></div>
    ),
    dots: (
      <div className="flex space-x-2">
        {[0, 1, 2].map((_, i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} bg-${color}-700 animate-bounce rounded-full`}
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    ),
    bar: (
      <div className={`h-2 w-40 bg-${color}-200 overflow-hidden rounded-full`}>
        <div className={`h-full bg-${color}-700 animate-loading-bar`}></div>
      </div>
    ),
    pulse: (
      <div className={`${sizeClasses[size]} bg-${color}-700 animate-pulse rounded-full`}></div>
    ),
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      {loaders[type]}
      {text && (
        <div className={`mt-4 font-semibold text-${color}-700 ${textSizeClasses[size]}`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Loader;
