import { Metadata } from 'next';

import { articlesApiGetArticleMeta } from '@/api/articles/articles';
import { buildSciCommonsTitle, humanizeSlug } from '@/lib/pageTitle';

import ArticleDisplayPageClient from './ArticleDisplayPageClient';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const defaultTitle = humanizeSlug(slug);
  const canonical = `/article/${slug}`;

  try {
    const res = await articlesApiGetArticleMeta(slug, {});
    const article = res.data;

    return {
      title: buildSciCommonsTitle(article.title, {
        fallbackSegment: 'Article',
        truncate: true,
      }),
      description: article.abstract,
      alternates: { canonical },
      openGraph: {
        type: 'article',
        url: canonical,
        title: article.title,
        description: article.abstract,
        images: article.article_image_url ? [article.article_image_url] : ['/og.png'],
        siteName: 'SciCommons',
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.abstract,
        images: article.article_image_url ? [article.article_image_url] : ['/og.png'],
      },
      robots: { index: true, follow: true },
    };
  } catch (e) {
    // Fallback minimal meta when API fails or is private
    return {
      title: buildSciCommonsTitle(defaultTitle, {
        fallbackSegment: 'Article',
        truncate: true,
      }),
      description: `Read the article "${defaultTitle || 'Article'}" on SciCommons.`,
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ArticleDisplayPageClient params={params} />;
}
