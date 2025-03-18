'use client';

import React, { use } from 'react';

import { withAuth } from '@/HOCs/withAuth';
import Notifications from '@/components/common/Notifications';

const ArticleNotifications = (props: { params: Promise<{ slug: string }> }) => {
  const params = use(props.params);
  return <Notifications article_slug={params?.slug} />;
};

export default withAuth(ArticleNotifications, 'article', async (props) => {
  const params = await props.params;
  return params.slug;
});
