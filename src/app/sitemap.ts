import { MetadataRoute } from 'next';

import { articlesApiGetArticles } from '@/api/articles/articles';

// Regenerate the sitemap once per day (24h = 86_400 s)
export const revalidate = 86_400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.scicommons.org';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/communities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Fetch all articles for dynamic sitemap generation
    const articlesResponse = await articlesApiGetArticles({
      per_page: 1000, // Get a large number of articles
      page: 1,
    });

    const articlePages: MetadataRoute.Sitemap = articlesResponse.data.items.map((article) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...articlePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if articles fetch fails
    return staticPages;
  }
}
