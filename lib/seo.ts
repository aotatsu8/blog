import type { Metadata } from 'next'
import { siteConfig, absoluteUrl } from './site'

/**
 * generateMetadata 用のヘルパと JSON-LD ビルダ。
 * canonical / OpenGraph / Twitter card を一括生成する。
 */

type BuildMetadataArgs = {
  title: string
  description: string
  /** サイトルートからの相対パス（例: "/blog/hello/"） */
  path: string
  /** OGP 画像の相対パス。未指定ならサイト共通のデフォルト画像 */
  ogImage?: string
  /** OpenGraph の type。記事は "article" */
  type?: 'website' | 'article'
}

export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  type = 'website',
}: BuildMetadataArgs): Metadata {
  const url = absoluteUrl(path)
  const image = absoluteUrl(ogImage ?? siteConfig.defaultOgImage)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: `@${siteConfig.author.twitter}`,
    },
  }
}

// --- JSON-LD ビルダ -------------------------------------------------------

export function articleJsonLd(args: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.title,
    description: args.description,
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
    image: [absoluteUrl(args.image ?? siteConfig.defaultOgImage)],
    url: absoluteUrl(args.path),
    mainEntityOfPage: absoluteUrl(args.path),
    author: { '@type': 'Person', name: siteConfig.author.name },
    publisher: { '@type': 'Person', name: siteConfig.author.name },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
