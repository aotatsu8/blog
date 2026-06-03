import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { getAllContent } from '@/lib/content'

/**
 * 全ページ・全 slug を列挙する sitemap。
 * output: 'export' のもとで sitemap.xml として静的生成される。
 */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['/', '/blog/', '/about/', '/privacy/']

  const blog = getAllContent('blog').map(({ slug, frontmatter }) => ({
    url: absoluteUrl(`/blog/${slug}/`),
    lastModified: frontmatter.updated ?? frontmatter.date,
  }))

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      changeFrequency: 'weekly' as const,
    })),
    ...blog,
  ]
}
