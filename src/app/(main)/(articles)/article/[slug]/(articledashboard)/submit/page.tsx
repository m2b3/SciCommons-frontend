'use client';

import React, { Suspense, use } from 'react';

import { withAuth } from '@/HOCs/withAuth';
import TabComponent from '@/components/communities/TabComponent';

import ArticleSubmissionStatus from './ArticleSubmissionStatus';
import SubmitToCommunity from './SubmitToCommunity';

type ActiveTab = 'Submit' | 'Status';

const SubmitArticleToCommunity = (props: { params: Promise<{ slug: string }> }) => {
  const params = use(props.params);
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Submit');

  return (
    <div className="flex flex-col">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Submit', 'Status']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {activeTab === 'Status' && <ArticleSubmissionStatus />}
      {activeTab === 'Submit' && (
        <Suspense>
          <SubmitToCommunity slug={params.slug} />
        </Suspense>
      )}
    </div>
  );
};

export default withAuth(SubmitArticleToCommunity, 'article', async (props) => {
  const params = await props.params;
  return params.slug;
});
