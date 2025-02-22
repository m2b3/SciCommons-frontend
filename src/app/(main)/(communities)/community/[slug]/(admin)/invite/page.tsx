'use client';

import React from 'react';

import { withAuth } from '@/HOCs/withAuth';
import TabComponent from '@/components/communities/TabComponent';

import StatusList from './StatusList';
import UnRegistered from './UnRegistered';

// type ActiveTab = 'Registered' | 'UnRegistered' | 'Status';
type ActiveTab = 'Send Invite' | 'Status';

const Invite = ({ params }: { params: { slug: string } }) => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Send Invite');

  return (
    <div className="flex flex-col">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Send Invite', 'Status']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {/* {activeTab === 'Registered' && <Registered />} */}
      {activeTab === 'Send Invite' && <UnRegistered />}
      {activeTab === 'Status' && <StatusList slug={params.slug} />}
    </div>
  );
};

export default withAuth(Invite, 'community', (props) => props.params.slug);
