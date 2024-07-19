import axios from 'axios';
import { create } from 'zustand';

interface ArticleData {
  title: string;
  authors: string[];
  abstract: string;
  link: string;
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
    set({ loading: true, error: null });
    let apiUrl = '';

    if (query.startsWith('10.')) {
      // Fetching from CrossRef
      apiUrl = `https://api.crossref.org/works/${query}`;
    } else if (query.startsWith('arXiv:')) {
      // Fetching from arXiv
      const arxivId = query.split(':')[1];
      apiUrl = `https://export.arxiv.org/api/query?id_list=${arxivId}`;
    } else if (query.startsWith(' :')) {
      // Fetching from PubMed
      const pmid = query.split(':')[1];
      apiUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
    } else {
      set({
        loading: false,
        error: 'Invalid input. Please enter a valid DOI, arXiv ID, or PubMed ID.',
      });
      return;
    }

    try {
      const response = await axios.get(apiUrl);
      const parsedData = parseData(query, response.data);
      set({ articleData: parsedData, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch article. Please try again.', loading: false });
    }
  },
}));

function parseData(query: string, data: any): ArticleData {
  if (query.startsWith('10.')) {
    // Parse CrossRef data
    return {
      title: data.message.title[0],
      authors: data.message.author.map((author: any) => `${author.given} ${author.family}`),
      abstract: data.message.abstract || 'No abstract available',
      link: data.message.URL,
    };
  } else if (query.startsWith('arXiv:')) {
    // Parse arXiv data
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    return {
      title: xmlDoc.getElementsByTagName('title')[1].textContent || '',
      authors: Array.from(xmlDoc.getElementsByTagName('author')).map(
        (author) => author.getElementsByTagName('name')[0].textContent || ''
      ),
      abstract: xmlDoc.getElementsByTagName('summary')[0].textContent || '',
      link: `https://arxiv.org/abs/${query.split(':')[1]}`,
    };
  } else if (query.startsWith('PMID:')) {
    // Parse PubMed data
    const result = data.result[data.result.uids[0]];
    return {
      title: result.title,
      authors: result.authors.map((author: any) => author.name),
      abstract: result.abstract || 'No abstract available',
      link: `https://pubmed.ncbi.nlm.nih.gov/${result.uids[0]}/`,
    };
  } else {
    throw new Error('Unsupported query type');
  }
}

export default useFetchExternalArticleStore;
