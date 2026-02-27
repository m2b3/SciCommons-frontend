import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface Tab {
  title: string;
  // Performance: Support both static content and lazy-loaded content functions
  // Functions prevent unnecessary component rendering until tab is active
  content: ReactNode | (() => ReactNode);
}

interface TabNavigationProps {
  tabs: Tab[];
  // Performance: Enable lazy loading by default to avoid rendering inactive tabs
  // Set to false if you need all tabs to render immediately (e.g., for SEO)
  lazyLoad?: boolean;
  initialActiveTab?: number;
  resetKey?: string | number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  lazyLoad = true,
  initialActiveTab = 0,
  resetKey,
}) => {
  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Allow an initial active tab and a reset trigger for tab state.
     Why: Some parents (e.g., discussions view) must open on a non-default tab.
     How: Clamp the initial index and reinitialize active/loading state when resetKey changes. */
  const safeInitialTab = Math.min(Math.max(initialActiveTab, 0), Math.max(tabs.length - 1, 0));
  const [activeTab, setActiveTab] = useState(safeInitialTab);
  const [underlineStyle, setUnderlineStyle] = useState({ width: '0px', left: '0px' });
  // Performance: Track which tabs have been visited to preserve their state
  // First tab (index 0) is loaded by default
  const [loadedTabs, setLoadedTabs] = useState<Set<number>>(new Set([safeInitialTab]));
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setActiveTab(safeInitialTab);
    if (lazyLoad) {
      setLoadedTabs(new Set([safeInitialTab]));
    }
  }, [lazyLoad, resetKey, safeInitialTab]);

  // Update the underline position when active tab changes
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      setUnderlineStyle({
        width: `${activeTabElement.offsetWidth}px`,
        left: `${activeTabElement.offsetLeft}px`,
      });
    }
  }, [activeTab, tabs]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    // Performance: Mark tab as loaded so it will render on next render cycle
    // Once loaded, tab stays in DOM (hidden) to preserve component state
    if (lazyLoad) {
      setLoadedTabs((prev) => new Set(prev).add(index));
    }
  };

  const renderTabContent = (tab: Tab, index: number) => {
    // If lazy loading is disabled, always render all tabs
    if (!lazyLoad) {
      return typeof tab.content === 'function' ? tab.content() : tab.content;
    }

    // Performance: Only render tabs that have been visited at least once
    // This prevents unnecessary API calls and component mounting for unvisited tabs
    if (!loadedTabs.has(index)) {
      return null;
    }

    // Execute function content or return static content
    return typeof tab.content === 'function' ? tab.content() : tab.content;
  };

  return (
    <div className="mt-0 text-text-secondary">
      <div className="relative">
        <div className="flex space-x-2 border-b border-common-contrast">
          {tabs.map((tab, index) => (
            <button
              key={tab.title}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className={`px-4 pb-2 text-xs transition-colors duration-200 sm:text-sm ${
                activeTab === index
                  ? 'text-functional-green'
                  : 'text-text-tertiary hover:text-functional-green'
              }`}
              onClick={() => handleTabClick(index)}
            >
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
        <div
          className="absolute bottom-0 h-0.5 rounded-sm bg-functional-green transition-all duration-500"
          style={underlineStyle}
        />
      </div>
      <div className="mt-4">
        {/* Performance: Render all tabs but hide inactive ones with CSS
            This preserves React component state when switching between tabs
            Only loaded tabs will have content rendered (see renderTabContent) */}
        {tabs.map((tab, index) => (
          <div key={tab.title} className={activeTab === index ? 'block' : 'hidden'}>
            {renderTabContent(tab, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
