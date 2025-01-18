import React, { useEffect } from 'react';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import clsx from 'clsx';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { StatusFilter } from '@/api/schemas';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';

const ArticleSubmissionStatus = () => {
  const params = useParams<{ slug: string }>();
  const imageData = useIdenticon(40);
  const { data: session } = useSession();

  const { data, isPending, error } = useArticlesApiGetArticle(
    params?.slug || '',
    {},
    {
      query: { enabled: !!session },
    }
  );

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <div className="my-4 rounded bg-white-secondary px-8 py-4 text-gray-900 shadow">
      <div className="mb-4 flex flex-col justify-center">
        <h1 className="font-bold res-text-xl">Article Submission Status</h1>
      </div>
      {isPending && <p className="res-text-base">Loading...</p>}
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
              <h3 className="cursor-pointer font-semibold res-text-base hover:underline">
                {data.data.community_article.community.name}
              </h3>
            </Link>
            <p className="text-gray-600 res-text-sm">
              {data.data.community_article.community.description}
            </p>
          </div>
          <div className="ml-auto">
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-white res-text-xs',
                data.data.community_article.status === StatusFilter.accepted && 'bg-green-500',
                data.data.community_article.status === StatusFilter.submitted && 'bg-gray-400',
                data.data.community_article.status === StatusFilter.under_review && 'bg-yellow-500',
                data.data.community_article.status === StatusFilter.rejected && 'bg-red-500',
                data.data.community_article.status === StatusFilter.published && 'bg-blue-500'
              )}
            >
              {data.data.community_article.status}
            </span>
          </div>
        </div>
      )}
      {data && !data.data.community_article && (
        <p className="text-gray-600 res-text-base">
          Article is not submitted to any community yet.
        </p>
      )}
    </div>
  );
};

export default ArticleSubmissionStatus;
