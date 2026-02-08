export function getCommunitySummaryText(description: string | null | undefined): string {
  const raw = (description ?? '').trim();
  if (!raw) return '';

  // Keep only the lead paragraph and drop markdown heading sections like "### GitHub".
  const beforeSectionHeaders = raw.split(/\n\s*#{1,6}\s+/)[0] ?? raw;

  // Render markdown links as plain label text.
  const withoutMarkdownLinks = beforeSectionHeaders.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

  return withoutMarkdownLinks.replace(/\s+/g, ' ').trim();
}
