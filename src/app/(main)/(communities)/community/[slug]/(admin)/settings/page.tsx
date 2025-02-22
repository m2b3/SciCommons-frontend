'use client';

import React, { useEffect, useState } from 'react';

import { withAuth } from '@/HOCs/withAuth';
import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import TabComponent from '@/components/communities/TabComponent';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

// import About from './About';
import AddRules from './AddRules';
import EditCommunityDetails from './EditCommunityDetails';

type ActiveTab = 'Details' | 'Rules' | 'About';

const Preferences = ({ params }: { params: { slug: string } }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Details');
  const accessToken = useAuthStore((state) => state.accessToken);

  // Get Community Details
  const { data, isPending, error, refetch } = useCommunitiesApiGetCommunity(params.slug, {
    query: { enabled: !!accessToken },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col">
      <div className="self-start">
        <TabComponent<ActiveTab>
          // tabs={['Details', 'Rules', 'About']}
          tabs={['Details', 'Rules']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {activeTab === 'Details' && (
        <EditCommunityDetails data={data} isPending={isPending} refetch={refetch} />
      )}
      {activeTab === 'Rules' && <AddRules data={data} isPending={isPending} />}
      {/* {activeTab === 'About' && <About data={data} />} */}
    </div>
  );
};

export default withAuth(Preferences, 'community', (props) => props.params.slug);
