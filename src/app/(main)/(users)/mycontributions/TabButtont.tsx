import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    className={`rounded-t-lg px-3 py-2 text-sm font-semibold ${
      active ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default TabButton;
