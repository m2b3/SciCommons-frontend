import axios from 'axios';
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

function parseData(query: string, data: any, source: string): ArticleData | null {
  if (source === 'CrossRef') {
    if (!data.message) return null;
    return {
      title: data.message.title?.[0] || 'No title available',
      authors:
        data.message.author?.map((author: any) =>
          `${author.given || ''} ${author.family || ''}`.trim()
        ) || [],
      abstract: data.message.abstract || 'No abstract available',
      link: data.message.URL || `https://doi.org/${query}`,
    };
  } else if (source === 'arXiv') {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    const entries = xmlDoc.getElementsByTagName('entry');
    let arxivId = query.split(':')[1];
    arxivId = arxivId.trim();
    if (entries.length === 0) return null;
    const links = Array.from(entries[0].getElementsByTagName('link'));
    const pdfLink = links
      .find((link) => link.getAttribute('title') === 'pdf')
      ?.getAttribute('href');
    return {
      title:
        entries[0].getElementsByTagName('title')[0]?.textContent?.trim() || 'No title available',
      authors: Array.from(entries[0].getElementsByTagName('author')).map(
        (author) => author.getElementsByTagName('name')[0]?.textContent || ''
      ),
      abstract:
        entries[0].getElementsByTagName('summary')[0]?.textContent?.replace(/\n/g, ' ')?.trim() ||
        'No abstract available',
      link: `https://arxiv.org/abs/${arxivId}`,
      pdfLink: pdfLink || '',
    };
  } else if (source === 'PubMed') {
    let pmid = query.split(':')[1];
    pmid = pmid.trim();
    if (!data.result || !data.result[pmid]) return null;
    const result = data.result[pmid];
    return {
      title: result.title || 'No title available',
      authors: result.authors?.map((author: any) => author.name) || [],
      abstract: result.abstract || 'No abstract available',
      link: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    };
  } else {
    return null;
  }
}

export default useFetchExternalArticleStore;
