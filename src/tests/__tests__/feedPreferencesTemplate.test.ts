/* Added by Claude on 2026-08-10
   What: Tests for the feed-preferences template parser.
   Why: The upload button is only useful if a filled template maps back onto the form
        fields reliably, including the awkward cases (commas in keywords, "source:id").
   How: Round-trip the shipped template and exercise the accepted file shapes. */
import { buildTemplateCsv, cleanEntries, parseTemplateText } from '@/lib/feedPreferences/template';

describe('parseTemplateText', () => {
  it('parses the template we hand out, ignoring comments and the header row', () => {
    const parsed = parseTemplateText('template.csv', buildTemplateCsv());

    expect(parsed.topics).toEqual(['auditory neuroscience', 'transformers']);
    expect(parsed.authors).toEqual(['Jennifer Doudna', 'David Chalmers']);
    expect(parsed.keywords).toEqual(['C. Elegans OR Caenorhabditis Elegans', 'JEPA']);
    expect(parsed.similar_to).toEqual(['pubmed:22878719']);
    expect(parsed.entryCount).toBe(7);
  });

  it('keeps a quoted comma inside the value and drops the notes column', () => {
    const csv = 'section,value,notes\nkeyword,"JEPA, transformers",my note\n';

    expect(parseTemplateText('f.csv', csv).keywords).toEqual(['JEPA, transformers']);
  });

  it('keeps the colon inside a similar_to identifier', () => {
    const text = 'Similar to: pubmed:22878719';

    expect(parseTemplateText('f.txt', text).similar_to).toEqual(['pubmed:22878719']);
  });

  it('reads values listed under a section header', () => {
    const text = [
      'Topics:',
      'auditory neuroscience',
      'transformers',
      '',
      'Authors:',
      'Jennifer Doudna',
    ].join('\n');
    const parsed = parseTemplateText('f.txt', text);

    expect(parsed.topics).toEqual(['auditory neuroscience', 'transformers']);
    expect(parsed.authors).toEqual(['Jennifer Doudna']);
  });

  it('accepts JSON and tolerates alias keys', () => {
    const json = JSON.stringify({
      topic: ['transformers'],
      similarTo: ['pubmed:1'],
      unknown: ['x'],
    });
    const parsed = parseTemplateText('f.json', json);

    expect(parsed.topics).toEqual(['transformers']);
    expect(parsed.similar_to).toEqual(['pubmed:1']);
    expect(parsed.entryCount).toBe(2);
  });

  it('rejects an empty file, a file with no recognisable rows, and broken JSON', () => {
    expect(() => parseTemplateText('f.csv', '   ')).toThrow('empty');
    expect(() => parseTemplateText('f.csv', 'nothing,useful\nhere,either')).toThrow(
      'No preferences found'
    );
    expect(() => parseTemplateText('f.json', '{ broken')).toThrow('syntax errors');
  });
});

describe('cleanEntries', () => {
  it('trims, drops blanks, and drops case-insensitive duplicates', () => {
    expect(
      cleanEntries(['  Jennifer Doudna  ', 'jennifer doudna', '', '   ', 'David Chalmers'])
    ).toEqual(['Jennifer Doudna', 'David Chalmers']);
  });
});
