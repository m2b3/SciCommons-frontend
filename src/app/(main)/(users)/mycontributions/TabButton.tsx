import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    className={`rounded-t-lg px-3 py-2 text-xs font-normal ${
      active
        ? 'border-b-2 border-functional-blueLight bg-functional-blue/10 text-functional-blueContrast dark:border-functional-blueContrast dark:text-functional-blueLight'
        : 'text-text-tertiary hover:bg-common-cardBackground'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default TabButton;
