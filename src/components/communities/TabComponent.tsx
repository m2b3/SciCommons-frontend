import React, { useEffect } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();

  const handleTabClick = (tab: ActiveTabType) => {
    setActiveTab(tab);
    router.push(`${pathname}?tab=${tab}`);
  };

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && tabs.includes(tab as ActiveTabType)) {
      setActiveTab(tab as ActiveTabType);
    }
  }, [searchParams]);

  return (
    <div className="scrollbar-hide flex w-full gap-2 overflow-x-auto rounded-full p-1 text-xs text-text-primary">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={clsx(
            'w-fit whitespace-nowrap rounded-full px-3 py-1.5 capitalize transition-all duration-200',
            {
              'bg-common-contrast': tab === activeTab,
              'bg-common-minimal/40 text-text-secondary': tab !== activeTab,
              'hover:bg-common-contrast/50': tab !== activeTab,
            }
          )}
          onClick={() => handleTabClick(tab as ActiveTabType)}
        >
          {tab.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
};

export default TabComponent;
