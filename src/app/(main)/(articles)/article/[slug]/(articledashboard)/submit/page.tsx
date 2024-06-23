'use client';

import React from 'react';

import TabComponent from '@/components/communities/TabComponent';

import ArticleSubmissionStatus from './ArticleSubmissionStatus';
import SubmitToCommunity from './SubmitToCommunity';

type ActiveTab = 'Submit' | 'Status';

const SubmitArticleToCommunity: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Status');

  return (
    <div className="flex flex-col">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Status', 'Submit']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {activeTab === 'Status' && <ArticleSubmissionStatus />}
      {activeTab === 'Submit' && <SubmitToCommunity />}
    </div>
  );
};

export default SubmitArticleToCommunity;
