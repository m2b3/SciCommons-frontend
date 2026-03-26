const MENTION_TOKEN_PATTERN = /(^|\s)@([A-Za-z0-9_.-]+)/g;

export function normalizeMentionUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function contentMentionsUsername(content: string, username: string): boolean {
  const normalizedUsername = normalizeMentionUsername(username);
  if (!normalizedUsername || !content.trim()) return false;

  const mentionMatcher = new RegExp(MENTION_TOKEN_PATTERN.source, 'g');
  let match: RegExpExecArray | null = null;

  while (true) {
    match = mentionMatcher.exec(content);
    if (!match) return false;

    if (normalizeMentionUsername(match[2]) === normalizedUsername) {
      return true;
    }
  }
}

export function buildMentionExcerpt(content: string, username: string, maxLength = 170): string {
  const condensedContent = content.replace(/\s+/g, ' ').trim();
  if (!condensedContent) return '';
  if (condensedContent.length <= maxLength) return condensedContent;

  const normalizedUsername = normalizeMentionUsername(username);
  const mentionToken = `@${normalizedUsername}`;
  const lowercaseContent = condensedContent.toLowerCase();
  const mentionIndex = lowercaseContent.indexOf(mentionToken);

  if (mentionIndex === -1) {
    return `${condensedContent.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
  }

  const contextPadding = Math.max(20, Math.floor((maxLength - mentionToken.length) / 2));
  let sliceStart = Math.max(0, mentionIndex - contextPadding);
  let sliceEnd = Math.min(
    condensedContent.length,
    mentionIndex + mentionToken.length + contextPadding
  );

  if (sliceEnd - sliceStart < maxLength) {
    if (sliceStart === 0) {
      sliceEnd = Math.min(condensedContent.length, maxLength);
    } else if (sliceEnd === condensedContent.length) {
      sliceStart = Math.max(0, condensedContent.length - maxLength);
    }
  }

  const prefix = sliceStart > 0 ? '...' : '';
  const suffix = sliceEnd < condensedContent.length ? '...' : '';

  return `${prefix}${condensedContent.slice(sliceStart, sliceEnd).trim()}${suffix}`;
}
