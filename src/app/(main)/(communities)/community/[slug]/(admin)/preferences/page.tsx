'use client';

import React, { useEffect } from 'react';

import { useSession } from 'next-auth/react';

import { withAuth } from '@/HOCs/withAuth';
import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import TabComponent from '@/components/communities/TabComponent';
import { showErrorToast } from '@/lib/toastHelpers';

import About from './About';
import AddRules from './AddRules';
import EditCommunityDetails from './EditCommunityDetails';

type ActiveTab = 'Details' | 'Rules' | 'About';

const Preferences = ({ params }: { params: { slug: string } }) => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Details');

  const { data: session } = useSession();

  // Get Community Details
  const { data, isPending, error, refetch } = useCommunitiesApiGetCommunity(params.slug, {
    query: { enabled: !!session },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col text-gray-900">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Details', 'Rules', 'About']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {activeTab === 'Details' && (
        <EditCommunityDetails data={data} isPending={isPending} refetch={refetch} />
      )}
      {activeTab === 'Rules' && <AddRules data={data} isPending={isPending} />}
      {activeTab === 'About' && <About data={data} />}
    </div>
  );
};

export default withAuth(Preferences, 'community', (props) => props.params.slug);
