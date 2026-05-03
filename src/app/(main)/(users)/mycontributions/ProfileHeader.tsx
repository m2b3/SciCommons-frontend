import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { BookOpen, Github, GraduationCap, Link as LinkIcon, Linkedin, Mail } from 'lucide-react';

import { BlockSkeleton, Skeleton } from '@/components/common/Skeleton';
import { getSafeExternalUrl } from '@/lib/safeUrl';

// NOTE(bsureshkrishna, 2026-02-07): External profile links are now sanitized before render
// (post-baseline 5271498) to prevent unsafe URL schemes.
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
}) => {
  const safeWebsite = getSafeExternalUrl(website);
  const safeGithub = getSafeExternalUrl(githubUrl);
  const safeLinkedin = getSafeExternalUrl(linkedinUrl);
  const safeScholar = getSafeExternalUrl(googleScholarUrl);
  const safePubMed = getSafeExternalUrl(pubMedUrl);

  return (
    <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:mb-6 md:gap-6 md:p-6">
      <div className="flex-shrink-0">
        <Image
          src={image}
          alt={`${name}'s profile`}
          width={150}
          height={150}
          className="aspect-square h-10 w-10 rounded-full object-cover sm:h-14 sm:w-14"
        />
      </div>
      <div className="min-w-0 flex-1 text-left">
        {/* Fixed by Codex on 2026-05-04
            Who: Codex
            What: Added a direct Edit Profile action beside the profile title.
            Why: Users on the contributions/profile surface need a faster path into profile editing.
            How: Wrapped the header row in a spaced flex layout and inserted a keyboard-accessible link styled as a button. */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-text-primary">{name}</h2>
          <Link
            href="/myprofile"
            className="inline-flex items-center rounded-full border border-common-contrast bg-common-minimal px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-common-minimal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/50"
          >
            Edit Profile
          </Link>
        </div>
        <p className="mt-2 break-words text-sm text-text-tertiary [overflow-wrap:anywhere]">
          {bio}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:justify-start">
          {email && (
            <div className="flex items-center text-text-tertiary">
              <Mail className="mr-1 h-4 w-4" />
              <a href={`mailto:${email}`} className="hover:text-text-primary hover:underline">
                {email}
              </a>
            </div>
          )}
          {safeWebsite && (
            <a
              href={safeWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-functional-blue hover:underline"
            >
              <LinkIcon className="mr-1 h-4 w-4" />
              <span>Website</span>
            </a>
          )}
          {safeGithub && (
            <a
              href={safeGithub}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-text-tertiary hover:text-text-primary"
            >
              <Github className="mr-1 h-4 w-4" />
              <span>GitHub</span>
            </a>
          )}
          {safeLinkedin && (
            <a
              href={safeLinkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#0077B5] hover:underline"
            >
              <Linkedin className="mr-1 h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          )}
          {safeScholar && (
            <a
              href={safeScholar}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-functional-blue hover:underline"
            >
              <GraduationCap className="mr-1 h-4 w-4" />
              <span>Scholar</span>
            </a>
          )}
          {safePubMed && (
            <a
              href={safePubMed}
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
};

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
