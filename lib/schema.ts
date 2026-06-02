import { z } from 'zod'

/**
 * 各コンテンツタイプの frontmatter スキーマ（zod）。
 * ビルド時に検証し、不正な frontmatter があればビルドを失敗させて早期に検知する。
 */

/** "YYYY-MM-DD" などの日付文字列を受け取り、妥当性を検証する共通ルール */
const dateString = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: '日付として解釈できません' })

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: dateString,
  updated: dateString.optional(),
  tags: z.array(z.string()).default([]),
  ogImage: z.string().optional(),
  /** アフィリエイトリンクを含む記事は true。PR 表記を自動表示する */
  hasAffiliate: z.boolean().default(false),
  /** 一覧から除外したい場合に true */
  draft: z.boolean().default(false),
})

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>

export const schemas = {
  blog: blogFrontmatterSchema,
} as const

export type ContentType = keyof typeof schemas
