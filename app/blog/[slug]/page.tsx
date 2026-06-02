import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getContentBySlug, getContentSlugs } from '@/lib/content'
import { renderMdx } from '@/lib/mdx'
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { PrBadge } from '@/components/PrBadge'
import { TagBadge } from '@/components/TagBadge'

type Params = { slug: string }

/** 静的書き出し: 全記事 slug を事前生成する */
export function generateStaticParams() {
  return getContentSlugs('blog').map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getContentBySlug('blog', slug)
  if (!post) return {}
  return buildMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    path: `/blog/${slug}/`,
    ogImage: post.frontmatter.ogImage,
    type: 'article',
  })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const post = getContentBySlug('blog', slug)
  if (!post) notFound()

  const { frontmatter, body } = post
  const content = await renderMdx(body)
  const path = `/blog/${slug}/`

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: frontmatter.title,
          description: frontmatter.description,
          path,
          datePublished: frontmatter.date,
          dateModified: frontmatter.updated,
          image: frontmatter.ogImage,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog/' },
          { name: frontmatter.title, path },
        ])}
      />

      <article>
        <header className="mb-8 space-y-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
            {frontmatter.updated && (
              <span>（更新: {formatDate(frontmatter.updated)}）</span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{frontmatter.title}</h1>
          {frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <TagBadge key={tag}>{tag}</TagBadge>
              ))}
            </div>
          )}
          {frontmatter.sourceUrl && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              この記事は{' '}
              <a
                href={frontmatter.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
              >
                {frontmatter.sourceName ?? '元記事'}
              </a>{' '}
              にも掲載しています。
            </p>
          )}
        </header>

        <div className="prose prose-neutral max-w-none dark:prose-invert">
          {/* hasAffiliate な記事は本文最上部に PR 表記を自動表示（ステマ規制対応） */}
          {frontmatter.hasAffiliate && <PrBadge />}
          {content}
        </div>
      </article>
    </>
  )
}
