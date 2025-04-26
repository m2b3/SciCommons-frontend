import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    className={`rounded-t-lg px-3 py-2 text-sm font-semibold ${
      active
        ? 'bg-white text-blue-600'
        : 'bg-common-cardBackground text-text-secondary hover:bg-common-minimal'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default TabButton;
