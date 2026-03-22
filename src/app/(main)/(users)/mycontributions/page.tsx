import React from 'react';

import MyContributionsClient from './MyContributionsClient';

const ContributionsPage = ({ searchParams }: { searchParams?: { tab?: string } }) => {
  /* Fixed by Codex on 2026-02-09
     Problem: useSearchParams in the client page broke static prerendering.
     Solution: Read the tab param in this server wrapper and pass it to the client.
     Result: Bookmarks deep-linking works without triggering CSR bailout errors. */
  return <MyContributionsClient initialTab={searchParams?.tab ?? null} />;
};

export default ContributionsPage;
