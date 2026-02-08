import { Metadata } from 'next';

import { articlesApiGetArticleMeta } from '@/api/articles/articles';

import ArticleDisplayPageClient from './ArticleDisplayPageClient';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // Build sane defaults first
  const slug = params.slug;
  const defaultTitle = slug.replace(/-/g, ' ');
  const canonical = `/article/${slug}`;

  try {
    const res = await articlesApiGetArticleMeta(slug, {});
    const article = res.data;

    return {
      title: article.title,
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
      title: defaultTitle,
      description: `Read the article \"${defaultTitle}\" on SciCommons.`,
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ArticleDisplayPageClient params={params} />;
}
