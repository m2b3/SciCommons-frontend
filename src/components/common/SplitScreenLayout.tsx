import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface SplitScreenLayoutProps {
  leftSide: ReactNode;
  rightSide: ReactNode;
  belowContent?: ReactNode;
  leftWidth?: string;
  rightWidth?: string;
}

const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  leftSide,
  rightSide,
  belowContent,
  leftWidth = 'w-2/3',
  rightWidth = 'w-1/3',
}) => {
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [leftContentHeight, setLeftContentHeight] = useState(0);
  const leftSideRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leftSide = leftSideRef.current;
    const container = containerRef.current;
    if (!leftSide || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === leftSide) {
          setLeftContentHeight(entry.contentRect.height);
          container.style.minHeight = `${entry.contentRect.height}px`;
        }
      }
    });

    resizeObserver.observe(leftSide);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (window.innerWidth >= 1024) {
        // Only apply this behavior for lg screens and up
        const leftSide = leftSideRef.current;
        const rightSide = rightSideRef.current;

        if (rightSide && rightSide.contains(e.target as Node)) {
          // If scrolling inside the right side, do nothing
          return;
        }

        if (leftSide) {
          const { scrollTop, scrollHeight, clientHeight } = leftSide;

          if (e.deltaY > 0 && scrollTop + clientHeight < scrollHeight) {
            // Scrolling down and left side has more to scroll
            e.preventDefault();
            leftSide.scrollTop += e.deltaY;
          } else if (e.deltaY < 0 && scrollTop > 0) {
            // Scrolling up and left side is not at the top
            e.preventDefault();
            leftSide.scrollTop += e.deltaY;
          }
          // If left side is at the top or bottom, allow normal page scroll
        }
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="container mx-auto"
      style={{ minHeight: `${leftContentHeight}px` }}
    >
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="p-4">{leftSide}</div>
        <div className="p-4">{rightSide}</div>
        {belowContent && <div className="p-4">{belowContent}</div>}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Left side */}
        <div
          ref={leftSideRef}
          className={`${leftWidth} custom-scrollbar h-screen overflow-y-auto p-4`}
        >
          {leftSide}
        </div>

        {/* Right side */}
        <div
          ref={rightSideRef}
          className={`${rightWidth} h-screen p-4 transition-all duration-300 ${
            isRightHovered ? 'custom-scrollbar overflow-y-auto' : 'overflow-y-hidden'
          }`}
          onMouseEnter={() => setIsRightHovered(true)}
          onMouseLeave={() => setIsRightHovered(false)}
        >
          {rightSide}
        </div>
      </div>

      {/* Additional content below main container */}
      {belowContent && <div className="mt-8 p-4">{belowContent}</div>}
    </div>
  );
};

export default SplitScreenLayout;
