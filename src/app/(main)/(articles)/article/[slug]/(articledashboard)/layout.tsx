'use client';

import { useParams } from 'next/navigation';

import { Settings } from 'lucide-react';

import Sidebar from '@/components/common/Sidebar';

export default function ArticleAuthorLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  const links = [
    // {
    //   href: `/article/${params?.slug}/official-stats`,
    //   label: 'Official Stats',
    //   icon: <BarChart2 className="mr-3" />,
    // },
    // {
    //   href: `/article/${params?.slug}/community-stats`,
    //   label: 'Community Stats',
    //   icon: <PieChart className="mr-3" />,
    // },
    // {
    //   href: `/article/${params?.slug}/submit`,
    //   label: 'Submit',
    //   icon: <Send className="mr-3" />,
    // },
    // {
    //   href: `/article/${params?.slug}/notifications`,
    //   label: 'Notifications',
    //   icon: <Bell className="mr-3" />,
    // },
    {
      href: `/article/${params?.slug}/settings`,
      label: 'Settings',
      icon: <Settings className="mr-3" />,
    },
  ];
  return (
    <div className="flex">
      <Sidebar baseHref={`/article/${params?.slug}`} links={links} />
      <main className="ml-10 flex-1 p-4 pl-2 md:ml-64 md:pl-4">{children}</main>
    </div>
  );
}
