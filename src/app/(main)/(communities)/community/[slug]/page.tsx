'use client';

// Todo: Convert this to server side component loader
import React from 'react';

import { useCommunitiesApiGetCommunityDetail } from '@/api/communities/communities';
import SearchBar from '@/components/SearchBar';
import ArticleCard from '@/components/articles/ArticleCard';
import DisplayCommunitySkeletonLoader from '@/components/loaders/DisplayCommunitySkeletonLoader';
import { useAuthStore } from '@/stores/authStore';

import DisplayCommunity from './DisplayCommunity';

const articles = [
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra...',
    authors: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    community: 'Lorem ipsum dolor dolor',
    tags: ['gpt-3', 'deep-learning'],
    ratings: 39,
    comments: 52,
    discussions: 10,
    imageUrl: 'https://source.unsplash.com/random/400x400',
  },
  {
    title: 'Vestibulum ante ipsum primis in faucibus orci luctus et.',
    abstract:
      'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae...',
    authors: 'Vestibulum ante ipsum primis in faucibus orci luctus.',
    community: 'Vestibulum ante ipsum primis',
    tags: ['machine-learning', 'ai'],
    ratings: 45,
    comments: 60,
    discussions: 15,
    imageUrl: 'https://source.unsplash.com/random/400x401',
  },
  {
    title: 'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.',
    abstract:
      'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Proin eget tortor risus...',
    authors: 'Curabitur non nulla sit amet.',
    community: 'Curabitur non nulla',
    tags: ['data-science', 'statistics'],
    ratings: 30,
    comments: 40,
    discussions: 20,
    imageUrl: 'https://source.unsplash.com/random/400x402',
  },
  {
    title: 'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.',
    abstract:
      'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Vivamus magna justo...',
    authors: 'Praesent sapien massa',
    community: 'Praesent sapien',
    tags: ['neural-networks', 'deep-learning'],
    ratings: 50,
    comments: 70,
    discussions: 25,
    imageUrl: 'https://source.unsplash.com/random/400x403',
  },
  {
    title: 'Quisque velit nisi, pretium ut lacinia in, elementum id enim.',
    abstract:
      'Quisque velit nisi, pretium ut lacinia in, elementum id enim. Curabitur arcu erat...',
    authors: 'Quisque velit nisi',
    community: 'Quisque velit',
    tags: ['natural-language-processing', 'nlp'],
    ratings: 55,
    comments: 65,
    discussions: 30,
    imageUrl: 'https://source.unsplash.com/random/400x404',
  },
];

const Community = ({ params }: { params: { slug: string } }) => {
  console.log(params);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, error, isPending } = useCommunitiesApiGetCommunityDetail(Number(params.slug), {
    axios: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  if (error) {
    console.error('Error fetching community:', error);
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container flex min-h-screen flex-col space-y-4 py-8">
      {isPending ? (
        <DisplayCommunitySkeletonLoader />
      ) : (
        <DisplayCommunity
          profileImage={data.data.profile_pic_url}
          coverImage="/auth/register.png"
          communityName={data.data.name}
          description={data.data.description}
          members={200}
          articlesPublished={10}
        />
      )}
      <div className="space-y-2">
        <SearchBar />
        <div className="flex flex-col space-y-4">
          {articles.map((article, index) => (
            <ArticleCard key={index} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
