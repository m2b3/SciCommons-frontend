import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import clsx from 'clsx';
import toast from 'react-hot-toast';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useAuthStore } from '@/stores/authStore';

const ArticleSubmissionStatus = () => {
  const params = useParams<{ slug: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { data, isPending, error } = useArticlesApiGetArticle(params.slug, {
    query: { enabled: !!accessToken },
    request: axiosConfig,
  });

  // Toast notifications for UI Feedback
  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="my-4 rounded bg-white px-8 py-4 shadow">
      <div className="mb-4 flex flex-col justify-center">
        <h1 className="text-xl font-bold">Article Submission Status</h1>
      </div>
      {isPending && <p>Loading...</p>}
      {data && data.data.community && (
        <div className="flex items-center">
          <div className="h-16 w-16">
            <Image
              className="rounded-full"
              src={data.data.community.profile_pic_url || '/images/placeholder.png'}
              alt="Article"
              width={64}
              height={64}
              objectFit="cover"
            />
          </div>
          <div className="ml-4">
            <Link href={`/community/${data.data.community.name}`}>
              <h3 className="cursor-pointer text-lg font-semibold hover:underline">
                {data.data.community.name}
              </h3>
            </Link>
            <p className="text-gray-600">{data.data.community.description}</p>
          </div>
          <div className="ml-auto">
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-white',
                data.data.status === 'Approved' && 'bg-green-500',
                data.data.status === 'Pending' && 'bg-gray-400',
                data.data.status === 'Rejected' && 'bg-red-500'
              )}
            >
              {data.data.status}
            </span>
          </div>
        </div>
      )}
      {data && !data.data.community && (
        <p className="text-gray-600">Article is not submitted to any community yet.</p>
      )}
    </div>
  );
};

export default ArticleSubmissionStatus;
