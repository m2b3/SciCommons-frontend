import React from 'react';

import Image from 'next/image';

import { BookOpen, Github, GraduationCap, Link as LinkIcon, Linkedin, Mail } from 'lucide-react';

import { BlockSkeleton, Skeleton } from '@/components/common/Skeleton';

interface ProfileHeaderProps {
  name: string;
  image: string;
  bio: string;
  email?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  googleScholarUrl?: string;
  pubMedUrl?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  image,
  bio,
  email,
  website,
  githubUrl,
  linkedinUrl,
  googleScholarUrl,
  pubMedUrl,
}) => (
  <div className="mb-4 flex items-start gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:mb-6 md:gap-6 md:p-6">
    <div className="flex-shrink-0">
      <Image
        src={image}
        alt={`${name}'s profile`}
        width={150}
        height={150}
        className="aspect-square h-10 w-10 rounded-full object-cover sm:h-14 sm:w-14"
      />
    </div>
    <div className="text-left">
      <h2 className="text-xl font-bold text-text-primary">{name}</h2>
      <p className="mt-2 max-w-2xl text-sm text-text-tertiary">{bio}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:justify-start">
        {email && (
          <div className="flex items-center text-text-tertiary">
            <Mail className="mr-1 h-4 w-4" />
            <a href={`mailto:${email}`} className="hover:text-text-primary hover:underline">
              {email}
            </a>
          </div>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-functional-blue hover:underline"
          >
            <LinkIcon className="mr-1 h-4 w-4" />
            <span>Website</span>
          </a>
        )}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-text-tertiary hover:text-text-primary"
          >
            <Github className="mr-1 h-4 w-4" />
            <span>GitHub</span>
          </a>
        )}
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-[#0077B5] hover:underline"
          >
            <Linkedin className="mr-1 h-4 w-4" />
            <span>LinkedIn</span>
          </a>
        )}
        {googleScholarUrl && (
          <a
            href={googleScholarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-functional-blue hover:underline"
          >
            <GraduationCap className="mr-1 h-4 w-4" />
            <span>Scholar</span>
          </a>
        )}
        {pubMedUrl && (
          <a
            href={pubMedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-functional-green hover:underline"
          >
            <BookOpen className="mr-1 h-4 w-4" />
            <span>PubMed</span>
          </a>
        )}
      </div>
    </div>
  </div>
);

export default ProfileHeader;

export const ProfileHeaderSkeleton: React.FC = () => (
  <Skeleton className="flex w-full flex-row items-center gap-4 overflow-x-hidden rounded-xl border border-common-contrast bg-common-cardBackground">
    <BlockSkeleton className="h-10 w-10 shrink-0 rounded-full" />
    <div className="flex flex-col gap-2">
      <BlockSkeleton className="h-6 w-32" />
      <BlockSkeleton className="h-4 w-64" />
      <BlockSkeleton className="h-4 w-56" />
    </div>
  </Skeleton>
);
