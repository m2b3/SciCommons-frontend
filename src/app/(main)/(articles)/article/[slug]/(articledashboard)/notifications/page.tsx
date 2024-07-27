'use client';

import React from 'react';

import { useParams } from 'next/navigation';

import Notifications from '@/components/common/Notifications';

const ArticleNotifications: React.FC = () => {
  const params = useParams<{ slug: string }>();

  return <Notifications article_slug={params.slug} />;
};

export default ArticleNotifications;
