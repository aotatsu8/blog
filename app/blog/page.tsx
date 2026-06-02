import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { getAllContent } from '@/lib/content'
import { BLOG_CATEGORIES } from '@/lib/schema'
import { BlogList, type BlogListItem } from '@/components/BlogList'

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: '技術記事・レビュー・知見をまとめた記事一覧です。',
  path: '/blog/',
})

export default function BlogPage() {
  // サーバーで全記事を取得し、クライアントの BlogList でカテゴリ絞り込みを行う
  const posts: BlogListItem[] = getAllContent('blog').map(({ slug, frontmatter }) => ({
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    category: frontmatter.category,
    tags: frontmatter.tags,
    hasAffiliate: frontmatter.hasAffiliate,
  }))

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          技術から日常・旅・グルメまで。カテゴリで絞り込めます。
        </p>
      </header>
      <BlogList posts={posts} categories={BLOG_CATEGORIES} />
    </div>
  )
}
