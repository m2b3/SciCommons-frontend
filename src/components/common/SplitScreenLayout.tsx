import React, { ReactNode, useState } from 'react';

interface SplitScreenLayoutProps {
  leftSide: ReactNode;
  rightSide: ReactNode;
  leftWidth?: string;
  rightWidth?: string;
}

const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  leftSide,
  rightSide,
  leftWidth = 'w-2/3',
  rightWidth = 'w-1/3',
}) => {
  const [isRightHovered, setIsRightHovered] = useState(false);

  return (
    <div className="container mx-auto">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="p-4">{leftSide}</div>
        <div className="p-4">{rightSide}</div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Left side */}
        <div className={`${leftWidth} p-4`}>{leftSide}</div>

        {/* Right side - Sticky */}
        <div className={`${rightWidth} p-4`}>
          <div
            className={`sticky top-20 max-h-screen overflow-y-auto transition-all duration-300 ${
              isRightHovered ? 'custom-scrollbar' : 'scrollbar-hide'
            }`}
            onMouseEnter={() => setIsRightHovered(true)}
            onMouseLeave={() => setIsRightHovered(false)}
          >
            {rightSide}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitScreenLayout;
