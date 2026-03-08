import React from 'react';
import { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

import MyContributionsClient from './MyContributionsClient';

const getMyContributionsTitleSegment = (tab?: string): string => {
  const normalizedTab = tab?.toLowerCase();

  if (normalizedTab === 'bookmarks') return 'Bookmarks';
  if (normalizedTab === 'articles') return 'My Articles';
  if (normalizedTab === 'communities') return 'My Communities';
  if (normalizedTab === 'awards') return 'My Awards';

  return 'My Contributions';
};

/* Fixed by Codex on 2026-03-08
   Who: Codex
   What: Added tab-aware metadata titles for the My Contributions route.
   Why: `/mycontributions?tab=bookmarks` should surface `Bookmarks: SciCommons` instead of a generic title.
   How: Map supported `tab` query values to title segments and compose final titles through the shared helper. */
export function generateMetadata({
  searchParams,
}: {
  searchParams?: { tab?: string };
}): Metadata {
  return {
    title: buildSciCommonsTitle(getMyContributionsTitleSegment(searchParams?.tab)),
  };
}

const ContributionsPage = ({ searchParams }: { searchParams?: { tab?: string } }) => {
  /* Fixed by Codex on 2026-02-09
     Problem: useSearchParams in the client page broke static prerendering.
     Solution: Read the tab param in this server wrapper and pass it to the client.
     Result: Bookmarks deep-linking works without triggering CSR bailout errors. */
  return <MyContributionsClient initialTab={searchParams?.tab ?? null} />;
};

export default ContributionsPage;
