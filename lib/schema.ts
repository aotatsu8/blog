import { z } from 'zod'

/**
 * 各コンテンツタイプの frontmatter スキーマ（zod）。
 * ビルド時に検証し、不正な frontmatter があればビルドを失敗させて早期に検知する。
 */

/** "YYYY-MM-DD" などの日付文字列を受け取り、妥当性を検証する共通ルール */
const dateString = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: '日付として解釈できません' })

/**
 * ブログ記事の絞り込み用カテゴリ（固定）。一覧のフィルタはこの5種で行う。
 * Qiita から取り込んだ記事は強制的に 'IT'、手書き記事は投稿時に1つ指定する。
 */
export const BLOG_CATEGORIES = ['IT', '日常', '旅', 'グルメ', 'work'] as const
export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: dateString,
  updated: dateString.optional(),
  /** 一覧の絞り込みに使う固定カテゴリ（必須・1つ） */
  category: z.enum(BLOG_CATEGORIES),
  /** 記事内に表示する細かいタグ（任意・複数）。絞り込みには使わない */
  tags: z.array(z.string()).default([]),
  ogImage: z.string().optional(),
  /** 外部の初出記事URL（例: Qiita からの転載元）。設定すると記事に出典リンクを表示する */
  sourceUrl: z.url().optional(),
  /** 出典サービス名の表示用ラベル（例: "Qiita"） */
  sourceName: z.string().optional(),
  /**
   * アフィリエイトリンクを含む記事は true で PR 表記を表示する。
   * 明示しなくても、本文に <AffiliateLink> / <ProductCard> があれば
   * lib/content.ts が自動で true にする（書き忘れ防止）。
   */
  hasAffiliate: z.boolean().default(false),
  /** 一覧から除外したい場合に true */
  draft: z.boolean().default(false),
})

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>

export const schemas = {
  blog: blogFrontmatterSchema,
} as const

export type ContentType = keyof typeof schemas
