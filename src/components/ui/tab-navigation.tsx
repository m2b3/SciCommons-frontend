import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface Tab {
  title: string;
  content: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({ width: '0px', left: '0px' });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      setUnderlineStyle({
        width: `${activeTabElement.offsetWidth}px`,
        left: `${activeTabElement.offsetLeft}px`,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="mt-6 text-gray-900 dark:text-gray-100">
      <div className="relative">
        <div className="flex space-x-4 border-b-2 border-gray-200 dark:border-gray-700">
          {tabs.map((tab, index) => (
            <button
              key={tab.title}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className={`px-4 pb-2 transition-colors duration-200 ${
                activeTab === index
                  ? 'text-green-500 dark:text-green-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab(index)}
            >
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
        <div
          className="absolute bottom-0 h-1 bg-green-500 transition-all duration-500 dark:bg-green-400"
          style={underlineStyle}
        />
      </div>
      <div className="mt-4">{tabs[activeTab].content}</div>
    </div>
  );
};

export default TabNavigation;
