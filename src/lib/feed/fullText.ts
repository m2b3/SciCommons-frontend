
import { useQuery } from '@tanstack/react-query';

import type { FullTextResponse, FullTextSection } from '@/app/api/pubmed/fulltext/[pmcid]/route';

export type { FullTextBlock, FullTextResponse, FullTextSection } from '@/app/api/pubmed/fulltext/[pmcid]/route';

/** Thrown for a definitive "this paper has no open-access full text". */
export class FullTextUnavailableError extends Error {}

export const fetchFullText = async (pmcid: string): Promise<FullTextResponse> => {
  const response = await fetch(`/api/pubmed/fulltext/${pmcid}`);

  if (response.status === 404) {
    throw new FullTextUnavailableError('No open-access full text for this article');
  }
  if (!response.ok) {
    throw new Error(`Full text request failed (${response.status})`);
  }

  return (await response.json()) as FullTextResponse;
};

export const useFullText = (pmcid: string | undefined) =>
  useQuery({
    queryKey: ['pubmed-fulltext', pmcid],
    queryFn: () => fetchFullText(pmcid as string),
    enabled: !!pmcid,
    staleTime: Infinity,
    // A paper outside the OA subset will never become available by asking again.
    retry: (failureCount, error) =>
      !(error instanceof FullTextUnavailableError) && failureCount < 2,
  });

/** Section ids/headings for the reader's in-page nav. */
export const sectionNav = (sections: FullTextSection[]) =>
  sections.map((s) => ({ id: s.id, heading: s.heading }));
