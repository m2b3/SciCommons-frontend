import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import clsx from 'clsx';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { StatusFilter } from '@/api/schemas';
import RenderParsedHTML from '@/components/common/RenderParsedHTML';
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
  const communityName = data?.data.community_article?.community.name ?? '';
  const encodedCommunityName = encodeURIComponent(communityName);

  /* Fixed by Codex on 2026-02-15
     Problem: Submission status panel used hard-coded grays and status colors.
     Solution: Replace fixed utilities with semantic tokens for surfaces, text, and status pills.
     Result: Status UI now reflects active skin palettes. */
  return (
    <div className="my-4 rounded bg-common-cardBackground px-8 py-4 text-text-primary shadow">
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
            <Link href={`/community/${encodedCommunityName}`}>
              <h3 className="cursor-pointer font-semibold res-text-base hover:underline">
                {data.data.community_article.community.name}
              </h3>
            </Link>
            <RenderParsedHTML
              rawContent={data.data.community_article.community.description || ''}
              supportMarkdown={true}
              supportLatex={false}
              containerClassName="mb-0"
              contentClassName="line-clamp-2 text-text-secondary res-text-sm"
            />
          </div>
          <div className="ml-auto">
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-primary-foreground res-text-xs',
                data.data.community_article.status === StatusFilter.accepted &&
                  'bg-functional-green',
                data.data.community_article.status === StatusFilter.submitted &&
                  'bg-functional-gray',
                data.data.community_article.status === StatusFilter.under_review &&
                  'bg-functional-yellow',
                data.data.community_article.status === StatusFilter.rejected && 'bg-functional-red',
                data.data.community_article.status === StatusFilter.published &&
                  'bg-functional-blue'
              )}
            >
              {data.data.community_article.status}
            </span>
          </div>
        </div>
      )}
      {data && !data.data.community_article && (
        <p className="text-text-secondary res-text-base">
          Article is not submitted to any community yet.
        </p>
      )}
    </div>
  );
};

export default ArticleSubmissionStatus;
