import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { schemas, type BlogFrontmatter, type ContentType } from './schema'

/**
 * `content/<type>/*.mdx` を読み込み、gray-matter で frontmatter を抽出し、
 * zod で検証して返すビルド時専用のコンテンツローダ。
 * Node の fs を使うため Server Component / generateStaticParams からのみ呼ぶこと。
 */

const CONTENT_DIR = path.join(process.cwd(), 'content')

type FrontmatterMap = {
  blog: BlogFrontmatter
}

export type ContentItem<T extends ContentType> = {
  slug: string
  frontmatter: FrontmatterMap[T]
  /** MDX 本文（frontmatter を除いた部分） */
  body: string
}

function readType<T extends ContentType>(type: T): ContentItem<T>[] {
  const dir = path.join(CONTENT_DIR, type)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))

  return files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(dir, file), 'utf8')
    const { data, content } = matter(raw)

    const parsed = schemas[type].safeParse(data)
    if (!parsed.success) {
      // ビルドを止めて不正な frontmatter を早期検知する
      throw new Error(
        `Invalid frontmatter in content/${type}/${file}:\n${parsed.error.message}`,
      )
    }

    const frontmatter = parsed.data as FrontmatterMap[T]

    // ステマ規制対応: 本文にアフィリエイト系コンポーネントを含む記事は、
    // frontmatter の指定に関わらず hasAffiliate を true にして PR 表記を強制する。
    if (type === 'blog' && /<(AffiliateLink|ProductCard)\b/.test(content)) {
      ;(frontmatter as BlogFrontmatter).hasAffiliate = true
    }

    return {
      slug,
      frontmatter,
      body: content,
    }
  })
}

/** draft を除外し、date 降順でソートして全件返す */
export function getAllContent<T extends ContentType>(type: T): ContentItem<T>[] {
  const items = readType(type).filter((item) => !item.frontmatter.draft)

  items.sort((a, b) => {
    const aDate = Date.parse(a.frontmatter.date)
    const bDate = Date.parse(b.frontmatter.date)
    return bDate - aDate
  })

  return items
}

/** slug 一致のコンテンツを1件返す（なければ null） */
export function getContentBySlug<T extends ContentType>(
  type: T,
  slug: string,
): ContentItem<T> | null {
  return readType(type).find((item) => item.slug === slug) ?? null
}

/** generateStaticParams 用に slug 一覧を返す（draft 含む全件） */
export function getContentSlugs(type: ContentType): string[] {
  return readType(type).map((item) => item.slug)
}
