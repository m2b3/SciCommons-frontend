const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const decodeCodePoint = (value: number): string => {
  if (!Number.isFinite(value) || value < 0) return '';
  try {
    return String.fromCodePoint(value);
  } catch {
    return '';
  }
};

/**
 * Decode common HTML entities (including numeric entities like `&#x20`) so
 * escaped backend payload artifacts render as normal text in the UI.
 */
export const decodeHtmlEntities = (input: string): string => {
  let decoded = input;

  for (let pass = 0; pass < 2; pass += 1) {
    const next = decoded
      .replace(/&#x([0-9a-fA-F]+)(?:;|(?=\s|$))/g, (_match, hexDigits: string) =>
        decodeCodePoint(parseInt(hexDigits, 16))
      )
      .replace(/&#([0-9]+)(?:;|(?=\s|$))/g, (_match, decimalDigits: string) =>
        decodeCodePoint(parseInt(decimalDigits, 10))
      )
      .replace(/&([a-zA-Z]+);/g, (match, name: string) => {
        const normalizedName = name.toLowerCase();
        return NAMED_HTML_ENTITIES[normalizedName] ?? match;
      });

    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
};
