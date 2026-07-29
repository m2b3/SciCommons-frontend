
import { NextRequest, NextResponse } from 'next/server';

const BIOC_BASE = 'https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json';

/** Sections that add length without reading value in a feed reader. */
const SKIPPED_SECTIONS = new Set([
  'REF',
  'ACK_FUND',
  'AUTH_CONT',
  'COMP_INT',
  'SUPPL',
  'ABBR',
  'APPENDIX',
]);

/** Captions belong to the section they interrupt, not to a section of their own. */
const CAPTION_SECTIONS = new Set(['FIG', 'TABLE']);

const SECTION_LABELS: Record<string, string> = {
  ABSTRACT: 'Abstract',
  INTRO: 'Introduction',
  METHODS: 'Methods',
  RESULTS: 'Results',
  DISCUSS: 'Discussion',
  CONCL: 'Conclusion',
  CASE: 'Case study',
};

export interface FullTextBlock {
  kind: 'heading' | 'paragraph' | 'caption';
  /** Heading depth (1 = section heading). Only meaningful for `heading`. */
  level: number;
  text: string;
  /** Character offset in the source document. Kept for future highlight anchoring. */
  offset: number;
}

export interface FullTextSection {
  /** Slug used for the in-page section nav. */
  id: string;
  type: string;
  heading: string;
  blocks: FullTextBlock[];
}

export interface FullTextResponse {
  pmcid: string;
  sections: FullTextSection[];
}

interface BioCPassage {
  text?: string;
  offset?: number;
  infons?: { section_type?: string; type?: string };
}

const labelFor = (sectionType: string) =>
  SECTION_LABELS[sectionType] ??
  sectionType.charAt(0) + sectionType.slice(1).toLowerCase().replace(/_/g, ' ');

function toSections(passages: BioCPassage[]): FullTextSection[] {
  const sections: FullTextSection[] = [];
  let current: FullTextSection | null = null;
  const usedIds = new Set<string>();

  const startSection = (sectionType: string): FullTextSection => {
    let id = sectionType.toLowerCase();
    let n = 2;
    while (usedIds.has(id)) id = `${sectionType.toLowerCase()}-${n++}`;
    usedIds.add(id);
    const section: FullTextSection = {
      id,
      type: sectionType,
      heading: labelFor(sectionType),
      blocks: [],
    };
    sections.push(section);
    return section;
  };

  for (const passage of passages) {
    const text = passage.text?.trim();
    if (!text) continue;

    const sectionType = passage.infons?.section_type ?? '';
    const type = passage.infons?.type ?? '';

    // The article title is rendered from our own feed metadata, not from here.
    if (sectionType === 'TITLE' || type === 'front') continue;
    if (SKIPPED_SECTIONS.has(sectionType)) continue;

    const offset = passage.offset ?? 0;

    // A figure/table caption interrupts a section rather than beginning one -- appending
    // it to the section in progress keeps Results from being split into fragments.
    if (CAPTION_SECTIONS.has(sectionType)) {
      if (current) current.blocks.push({ kind: 'caption', level: 0, text, offset });
      continue;
    }

    if (!current || current.type !== sectionType) current = startSection(sectionType);

    const headingMatch = /^(?:abstract_)?title(?:_(\d+))?$/.exec(type);
    if (headingMatch) {
      const level = Number(headingMatch[1] ?? 1);
      // The first depth-1 heading names the section; deeper ones are real subheadings.
      if (level <= 1 && current.blocks.length === 0) {
        current.heading = text;
      } else {
        current.blocks.push({ kind: 'heading', level, text, offset });
      }
      continue;
    }

    current.blocks.push({ kind: 'paragraph', level: 0, text, offset });
  }

  return sections.filter((s) => s.blocks.length > 0);
}

export async function GET(_request: NextRequest, { params }: { params: { pmcid: string } }) {
  const { pmcid } = params;

  // This value is interpolated into an outbound URL, so constrain it strictly.
  if (!/^PMC\d+$/.test(pmcid)) {
    return NextResponse.json({ error: 'Invalid PMC id' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BIOC_BASE}/${pmcid}/unicode`, {
      headers: { Accept: 'application/json' },
      // Published papers are immutable; a day of caching also keeps us far inside
      // NCBI's rate limits when many readers open the same paper.
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Full text is not available for this article' },
        { status: upstream.status === 404 ? 404 : 502 }
      );
    }

    // Papers outside the open-access subset come back as a plain-text error with a 200,
    // so the status code alone can't be trusted -- parse defensively.
    const raw = await upstream.text();
    let collection: unknown;
    try {
      collection = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: 'Full text is not available for this article' },
        { status: 404 }
      );
    }

    const documents = Array.isArray(collection)
      ? (collection[0] as { documents?: { passages?: BioCPassage[] }[] })?.documents
      : undefined;
    const passages = documents?.[0]?.passages;

    if (!passages?.length) {
      return NextResponse.json(
        { error: 'Full text is not available for this article' },
        { status: 404 }
      );
    }

    const body: FullTextResponse = { pmcid, sections: toSections(passages) };

    if (body.sections.length === 0) {
      return NextResponse.json(
        { error: 'Full text is not available for this article' },
        { status: 404 }
      );
    }

    return NextResponse.json(body, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[pubmed/fulltext] failed for', pmcid, error);
    return NextResponse.json({ error: 'Failed to fetch full text' }, { status: 500 });
  }
}
