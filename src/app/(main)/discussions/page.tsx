'use client';

import React from 'react';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';

import DiscussionsPageClient from './DiscussionsPageClient';

const DiscussionsPage: React.FC = () => {
  return <DiscussionsPageClient />;
};

export default withAuthRedirect(DiscussionsPage);
