import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import clsx from 'clsx';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { StatusFilter } from '@/api/schemas';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const ArticleSubmissionStatus = () => {
  const params = useParams<{ slug: string }>();
  const imageData = useIdenticon(40);
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { data, isPending, error } = useArticlesApiGetArticle(
    params?.slug || '',
    {},
    {
      query: { enabled: !!accessToken },
      request: axiosConfig,
    }
  );

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <div className="my-4 rounded bg-white px-8 py-4 shadow dark:bg-gray-800">
      <div className="mb-4 flex flex-col justify-center">
        <h1 className="text-xl font-bold dark:text-white">Article Submission Status</h1>
      </div>
      {isPending && <p className="dark:text-gray-300">Loading...</p>}
      {data && data.data.community_article && (
        <div className="flex items-center">
          <Image
            className="h-16 w-16 rounded-full"
            src={
              data.data.community_article.community.profile_pic_url ||
              `data:image/png;base64,${imageData}`
            }
            alt="Article"
            width={64}
            height={64}
            objectFit="cover"
          />
          <div className="ml-4">
            <Link href={`/community/${data.data.community_article.community.name}`}>
              <h3 className="cursor-pointer text-lg font-semibold hover:underline dark:text-white">
                {data.data.community_article.community.name}
              </h3>
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              {data.data.community_article.community.description}
            </p>
          </div>
          <div className="ml-auto">
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-white',
                data.data.community_article.status === StatusFilter.accepted &&
                  'bg-green-500 dark:bg-green-600',
                data.data.community_article.status === StatusFilter.submitted &&
                  'bg-gray-400 dark:bg-gray-500',
                data.data.community_article.status === StatusFilter.under_review &&
                  'bg-yellow-500 dark:bg-yellow-600',
                data.data.community_article.status === StatusFilter.rejected &&
                  'bg-red-500 dark:bg-red-600',
                data.data.community_article.status === StatusFilter.published &&
                  'bg-blue-500 dark:bg-blue-600'
              )}
            >
              {data.data.community_article.status}
            </span>
          </div>
        </div>
      )}
      {data && !data.data.community_article && (
        <p className="text-gray-600 dark:text-gray-400">
          Article is not submitted to any community yet.
        </p>
      )}
    </div>
  );
};

export default ArticleSubmissionStatus;
