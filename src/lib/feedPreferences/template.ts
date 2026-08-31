/* Added by Claude on 2026-08-10
   What: Template helpers for the Feed Preferences page - build a blank template and
         parse a filled one back into form values.
   Why: Filling four preference lists by hand every time is tedious; users keep their
        criteria in a file and upload it instead.
   How: Parse client-side so the parsed values land in the form for review before the
        user saves. The backend still validates whatever is finally submitted. */

export interface FeedPreferenceValues {
  topics: string[];
  authors: string[];
  keywords: string[];
  similar_to: string[];
}

export type FeedPreferenceField = keyof FeedPreferenceValues;

export const EMPTY_PREFERENCES: FeedPreferenceValues = {
  topics: [],
  authors: [],
  keywords: [],
  similar_to: [],
};

// Every spelling we accept for a section label, mapped to the field it fills.
const FIELD_ALIASES: Record<string, FeedPreferenceField> = {
  topic: 'topics',
  topics: 'topics',
  area: 'topics',
  areas: 'topics',
  interest: 'topics',
  interests: 'topics',
  'areas or topics of interest': 'topics',
  author: 'authors',
  authors: 'authors',
  keyword: 'keywords',
  keywords: 'keywords',
  'similar to': 'similar_to',
  similar: 'similar_to',
  similar_to: 'similar_to',
  similarto: 'similar_to',
};

const MAX_ENTRIES_PER_FIELD = 100;
const MAX_ENTRY_LENGTH = 500;

const resolveField = (label: string): FeedPreferenceField | null => {
  const normalized = label.trim().toLowerCase().replace(/:$/, '').replace(/[_-]+/g, ' ').trim();
  return FIELD_ALIASES[normalized] ?? FIELD_ALIASES[normalized.replace(/\s+/g, '_')] ?? null;
};

/** Trim, drop blanks, drop case-insensitive duplicates, cap the length. Mirrors the backend. */
export const cleanEntries = (values: string[]): string[] => {
  const cleaned: string[] = [];
  const seen = new Set<string>();

  for (const rawValue of values) {
    if (typeof rawValue !== 'string') continue;

    const value = rawValue.trim().slice(0, MAX_ENTRY_LENGTH);
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    cleaned.push(value);

    if (cleaned.length >= MAX_ENTRIES_PER_FIELD) break;
  }

  return cleaned;
};

/** Split one CSV line on commas, honouring double-quoted fields. */
const splitCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      // A doubled quote inside a quoted field is a literal quote.
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields.map((field) => field.trim());
};

const parseJsonTemplate = (text: string): FeedPreferenceValues => {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const values: FeedPreferenceValues = { topics: [], authors: [], keywords: [], similar_to: [] };

  Object.entries(parsed ?? {}).forEach(([key, rawValue]) => {
    const field = resolveField(key);
    if (!field) return;

    const entries = Array.isArray(rawValue) ? rawValue : [rawValue];
    values[field].push(...entries.filter((entry): entry is string => typeof entry === 'string'));
  });

  return values;
};

/**
 * Parse the line-based template. Both shapes work:
 *   topic,auditory neuroscience      (or "topic: auditory neuroscience")
 *   Topics:                          (section header, values on the lines below)
 *   auditory neuroscience
 */
const parseLineTemplate = (text: string): FeedPreferenceValues => {
  const values: FeedPreferenceValues = { topics: [], authors: [], keywords: [], similar_to: [] };
  let currentField: FeedPreferenceField | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Skip the header row of the CSV template.
    if (/^section\s*,\s*value/i.test(line)) continue;

    const csvFields = splitCsvLine(line);
    if (csvFields.length > 1) {
      const field = resolveField(csvFields[0]);
      if (field) {
        // Only the second column is the value; anything after it is the user's own notes.
        values[field].push(csvFields[1]);
        continue;
      }
    }

    // "Similar to: pubmed:22878719" - split on the first colon only, so the
    // "pubmed:22878719" part survives intact.
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const field = resolveField(line.slice(0, colonIndex));
      if (field) {
        const value = line.slice(colonIndex + 1).trim();
        if (value) {
          values[field].push(value);
        } else {
          // "Topics:" on its own is a section header.
          currentField = field;
        }
        continue;
      }
    }

    const headerField = resolveField(line);
    if (headerField) {
      currentField = headerField;
      continue;
    }

    if (currentField) {
      values[currentField].push(csvFields[0] || line);
    }
  }

  return values;
};

export interface ParsedTemplate extends FeedPreferenceValues {
  /** Total number of entries recognised across all four fields. */
  entryCount: number;
}

/** Parse an uploaded template file. Throws when the file cannot be read as a template. */
export const parseTemplateText = (fileName: string, text: string): ParsedTemplate => {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('That file is empty.');
  }

  const looksLikeJson =
    fileName.toLowerCase().endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[');

  let values: FeedPreferenceValues;
  if (looksLikeJson) {
    try {
      values = parseJsonTemplate(trimmed);
    } catch {
      throw new Error('That JSON file could not be read. Check it for syntax errors.');
    }
  } else {
    values = parseLineTemplate(trimmed);
  }

  const parsed: ParsedTemplate = {
    topics: cleanEntries(values.topics),
    authors: cleanEntries(values.authors),
    keywords: cleanEntries(values.keywords),
    similar_to: cleanEntries(values.similar_to),
    entryCount: 0,
  };

  parsed.entryCount =
    parsed.topics.length +
    parsed.authors.length +
    parsed.keywords.length +
    parsed.similar_to.length;

  if (parsed.entryCount === 0) {
    throw new Error(
      'No preferences found in that file. Rows should look like "topic,auditory neuroscience".'
    );
  }

  return parsed;
};

/** The blank template offered for download. */
export const buildTemplateCsv = (): string =>
  [
    '# SciCommons feed preferences template',
    '# One entry per row. Valid sections: topic, author, keyword, similar_to',
    '# Wrap a value in double quotes if it contains a comma.',
    '# Delete the example rows below and add your own.',
    'section,value,notes',
    'topic,auditory neuroscience,',
    'topic,transformers,',
    'author,Jennifer Doudna,',
    'author,David Chalmers,',
    'keyword,C. Elegans OR Caenorhabditis Elegans,boolean expressions are allowed',
    'keyword,JEPA,',
    'similar_to,pubmed:22878719,format is source:identifier',
    '',
  ].join('\n');

export const downloadTemplateCsv = () => {
  const blob = new Blob([buildTemplateCsv()], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'scicommons-feed-preferences-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
