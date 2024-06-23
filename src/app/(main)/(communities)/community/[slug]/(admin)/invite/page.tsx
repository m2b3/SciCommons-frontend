'use client';

import React from 'react';

import TabComponent from '@/components/communities/TabComponent';

import Registered from './Registered';
import StatusList from './StatusList';
import UnRegistered from './UnRegistered';

type ActiveTab = 'Registered' | 'UnRegistered' | 'Status';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Registered');

  return (
    <div className="flex flex-col">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Registered', 'UnRegistered', 'Status']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {activeTab === 'Registered' && <Registered />}
      {activeTab === 'UnRegistered' && <UnRegistered />}
      {activeTab === 'Status' && <StatusList />}
    </div>
  );
};

export default HomePage;
