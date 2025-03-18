'use client';

import React, { use } from 'react';

import { withAuth } from '@/HOCs/withAuth';
import TabComponent from '@/components/communities/TabComponent';

import Registered from './Registered';
import StatusList from './StatusList';
import UnRegistered from './UnRegistered';

type ActiveTab = 'Registered' | 'UnRegistered' | 'Status';

const Invite = (props: { params: Promise<{ slug: string }> }) => {
  const params = use(props.params);
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
      {activeTab === 'Status' && <StatusList slug={params.slug} />}
    </div>
  );
};

export default withAuth(Invite, 'community', async (props) => {
  const params = await props.params;
  return params.slug;
});
