'use client';

import React from 'react';

import { withAuth } from '@/HOCs/withAuth';
import Notifications from '@/components/common/Notifications';

const ArticleNotifications = ({ params }: { params: { slug: string } }) => {
  return <Notifications article_slug={params?.slug} />;
};

export default withAuth(ArticleNotifications, 'article', (props) => props.params.slug);
