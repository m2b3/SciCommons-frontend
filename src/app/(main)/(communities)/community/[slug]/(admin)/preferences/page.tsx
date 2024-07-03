'use client';

import React, { useEffect } from 'react';

import toast from 'react-hot-toast';

import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import TabComponent from '@/components/communities/TabComponent';
import { useAuthStore } from '@/stores/authStore';

import AddRules from './AddRules';
import EditCommunityDetails from './EditCommunityDetails';

type ActiveTab = 'Details' | 'Rules';

const Preferences = ({ params }: { params: { slug: string } }) => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Details');

  const accessToken = useAuthStore((state) => state.accessToken);

  // Get Community Details
  const { data, isPending, error, refetch } = useCommunitiesApiGetCommunity(params.slug, {
    query: { enabled: !!accessToken },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      console.log(error);
      toast.error(`Error: ${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="flex flex-col">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Details', 'Rules']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {activeTab === 'Details' && (
        <EditCommunityDetails data={data} isPending={isPending} refetch={refetch} />
      )}
      {activeTab === 'Rules' && <AddRules data={data} isPending={isPending} />}
    </div>
  );
};

export default Preferences;
