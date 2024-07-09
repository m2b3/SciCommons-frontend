'use client';

import React, { MouseEvent } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';

interface HashtagProps {
  hashtag: string;
  className?: string;
}

const Hashtag: React.FC<HashtagProps> = ({ hashtag, className }) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const modifiedHashtag = hashtag.replace('#', '');
  return (
    <Link
      href={`/posts?hashtag=${modifiedHashtag}`}
      className={cn(
        'z-10 mr-2 cursor-pointer text-sm text-functional-blue hover:underline',
        className
      )}
      onClick={handleClick}
    >
      {hashtag}
    </Link>
  );
};

export default Hashtag;
