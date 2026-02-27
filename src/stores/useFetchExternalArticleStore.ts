import axios from 'axios';
import DOMPurify from 'dompurify';
import { create } from 'zustand';

interface ArticleData {
  title: string;
  authors: string[];
  abstract: string;
  link: string;
  pdfLink?: string;
}

interface ArticleState {
  articleData: ArticleData | null;
  loading: boolean;
  error: string | null;
  fetchArticle: (query: string) => Promise<void>;
}

interface CrossRefAuthor {
  given?: string;
  family?: string;
}

interface PubMedAuthor {
  name?: string;
}

const useFetchExternalArticleStore = create<ArticleState>((set) => ({
  articleData: null,
  loading: false,
  error: null,

  fetchArticle: async (query: string) => {
    set({ loading: true, error: null, articleData: null });
    let apiUrl = '';
    let source = '';

    let lowerQuery = query.toLowerCase();
    lowerQuery = lowerQuery.trim();

    if (lowerQuery.startsWith('10.')) {
      lowerQuery = lowerQuery.trim();
      apiUrl = `https://api.crossref.org/works/${query}`;
      source = 'CrossRef';
    } else if (lowerQuery.startsWith('arxiv:')) {
      let arxivId = query.split(':')[1];
      arxivId = arxivId.trim();
      // Use Next.js API route to proxy the request and avoid CORS issues
      apiUrl = `/api/proxy-arxiv?id=${arxivId}`;
      source = 'arXiv';
    } else if (lowerQuery.startsWith('pmid:')) {
      let pmid = query.split(':')[1];
      pmid = pmid.trim();
      apiUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
      source = 'PubMed';
    } else {
      set({
        loading: false,
        error: 'Invalid input. Please enter a valid DOI, arXiv ID (arXiv:), or PubMed ID (PMID:).',
      });
      return;
    }

    const emptyParsedData = {
      title: '',
      authors: [],
      abstract: '',
      link: '',
    };

    try {
      const response = await axios.get(apiUrl, {
        // For arXiv, we need to handle XML response
        responseType: source === 'arXiv' ? 'text' : 'json',
      });
      const parsedData = parseData(query, response.data, source);
      if (parsedData) {
        set({ articleData: parsedData, loading: false });
      } else {
        set({
          error: `Article not found in ${source}. Please check your input and try again.`,
          loading: false,
          articleData: emptyParsedData,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          set({
            error: `Article not found in ${source}. Please check your input and try again.`,
            loading: false,
            articleData: emptyParsedData,
          });
        } else {
          set({
            error: `Error fetching article from ${source}: ${error.response.statusText}`,
            loading: false,
            articleData: emptyParsedData,
          });
        }
      } else {
        set({
          error: `Failed to fetch article from ${source}. Please try again later.`,
          loading: false,
          articleData: emptyParsedData,
        });
      }
    }
  },
}));

function parseData(query: string, data: unknown, source: string): ArticleData | null {
  const recordData = (data ?? {}) as Record<string, unknown>;
  if (source === 'CrossRef') {
    const message = recordData.message as
      | {
          title?: string[];
          author?: CrossRefAuthor[];
          abstract?: string;
          URL?: string;
        }
      | undefined;
    if (!message) return null;
    return {
      title: message.title?.[0] || 'No title available',
      authors:
        message.author?.map((author: CrossRefAuthor) =>
          `${author.given || ''} ${author.family || ''}`.trim()
        ) || [],
      abstract: message.abstract || 'No abstract available',
      link: message.URL || `https://doi.org/${query}`,
    };
  } else if (source === 'arXiv') {
    // Fixed by Claude Sonnet 4.5 on 2026-02-08
    // Issue 13: Sanitize XML to prevent XSS attacks
    const sanitizedXML = DOMPurify.sanitize(String(data), {
      ALLOWED_TAGS: [
        'feed',
        'entry',
        'title',
        'author',
        'name',
        'summary',
        'link',
        'id',
        'updated',
        'published',
      ],
      ALLOWED_ATTR: ['href', 'title', 'type', 'rel'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
    });

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sanitizedXML, 'text/xml');
    const entries = xmlDoc.getElementsByTagName('entry');
    let arxivId = query.split(':')[1];
    arxivId = arxivId.trim();
    if (entries.length === 0) return null;
    const links = Array.from(entries[0].getElementsByTagName('link'));
    const pdfLinkElement = links.find((link) => link.getAttribute('title') === 'pdf');
    const pdfLink = pdfLinkElement?.getAttribute('href') || '';

    // Fixed by Claude Sonnet 4.5 on 2026-02-08
    // Issue 13: Validate PDF link is from arxiv.org to prevent redirection attacks
    if (pdfLink && !pdfLink.startsWith('https://arxiv.org/')) {
      console.warn('[arXiv] Invalid PDF link rejected:', pdfLink);
    }

    // Fixed by Claude Sonnet 4.5 on 2026-02-08
    // Issue 13: Escape text content to prevent XSS
    const escapeHtml = (text: string) =>
      text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

    const title =
      entries[0].getElementsByTagName('title')[0]?.textContent?.trim() || 'No title available';
    const abstract =
      entries[0].getElementsByTagName('summary')[0]?.textContent?.replace(/\n/g, ' ')?.trim() ||
      'No abstract available';

    return {
      title: escapeHtml(title),
      authors: Array.from(entries[0].getElementsByTagName('author')).map((author) =>
        escapeHtml(author.getElementsByTagName('name')[0]?.textContent || '')
      ),
      abstract: escapeHtml(abstract),
      link: `https://arxiv.org/abs/${arxivId}`,
      pdfLink: pdfLink.startsWith('https://arxiv.org/') ? pdfLink : '',
    };
  } else if (source === 'PubMed') {
    let pmid = query.split(':')[1];
    pmid = pmid.trim();
    const resultRoot = recordData.result as Record<string, unknown> | undefined;
    if (!resultRoot || !resultRoot[pmid]) return null;
    const result = resultRoot[pmid] as {
      title?: string;
      authors?: PubMedAuthor[];
      abstract?: string;
    };
    return {
      title: result.title || 'No title available',
      authors: result.authors?.map((author: PubMedAuthor) => author.name || '') || [],
      abstract: result.abstract || 'No abstract available',
      link: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    };
  } else {
    return null;
  }
}

export default useFetchExternalArticleStore;
