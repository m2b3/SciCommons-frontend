import { buildSciCommonsTitle, humanizeSlug, truncateTitleSegment } from '@/lib/pageTitle';

describe('pageTitle helpers', () => {
  it('builds section titles with the SciCommons suffix', () => {
    expect(buildSciCommonsTitle('Discussions')).toBe('Discussions: SciCommons');
  });

  it('keeps short segments unchanged', () => {
    expect(truncateTitleSegment('Short title')).toBe('Short title');
  });

  it('truncates long dynamic titles before appending site suffix', () => {
    const longArticleTitle =
      'A very long article title that should be shortened for browser tabs while remaining readable';

    const builtTitle = buildSciCommonsTitle(longArticleTitle, {
      fallbackSegment: 'Article',
      truncate: true,
    });

    const [segment] = builtTitle.split(': SciCommons');
    expect(segment.length).toBeLessThanOrEqual(55);
    expect(segment.endsWith('...')).toBe(true);
    expect(builtTitle.endsWith(': SciCommons')).toBe(true);
  });

  it('humanizes slug values for metadata fallback use', () => {
    expect(humanizeSlug('community-driven-science_2026')).toBe('Community Driven Science 2026');
  });
});
