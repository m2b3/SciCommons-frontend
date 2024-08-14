import React from 'react';

import { usePathname, useRouter } from 'next/navigation';

import clsx from 'clsx';

interface TabComponentProps<ActiveTabType extends string> {
  tabs: ActiveTabType[];
  activeTab: ActiveTabType;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTabType>>;
}

const TabComponent = <ActiveTabType extends string>({
  tabs,
  activeTab,
  setActiveTab,
}: TabComponentProps<ActiveTabType>) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabClick = (tab: ActiveTabType) => {
    setActiveTab(tab);
    router.push(`${pathname}?tab=${tab}`);
  };

  return (
    <div className="flex rounded-md bg-white-secondary p-1 text-gray-900 shadow res-text-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={clsx('rounded-md px-4 py-2 transition-all duration-300', {
            'bg-white-primary shadow-md': tab === activeTab,
            'text-gray-500': tab !== activeTab,
            'hover:bg-white-primary': tab !== activeTab,
          })}
          onClick={() => handleTabClick(tab as ActiveTabType)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabComponent;
