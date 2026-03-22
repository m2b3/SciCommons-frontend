import { decodeHtmlEntities } from '@/lib/htmlEntities';

describe('decodeHtmlEntities', () => {
  it('decodes trailing hexadecimal entities without semicolons', () => {
    expect(decodeHtmlEntities('Discussion topic&#x20')).toBe('Discussion topic ');
  });

  it('decodes decimal entities and common named entities', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry&#39;')).toBe("Tom & Jerry'");
  });

  it('decodes doubly escaped numeric entities in two passes', () => {
    expect(decodeHtmlEntities('Line end&amp;#x20')).toBe('Line end ');
  });

  it('leaves normal text unchanged', () => {
    expect(decodeHtmlEntities('Plain discussion text')).toBe('Plain discussion text');
  });
});
