'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TagBadge } from './TagBadge'

/** 一覧表示に必要な記事の最小データ（Server から渡すためシリアライズ可能な形） */
export type BlogListItem = {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  hasAffiliate: boolean
}

function formatDate(iso: string): string {
  // ロケール非依存に固定フォーマットで描画し、hydration ミスマッチを避ける
  const d = new Date(iso)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

/**
 * 記事一覧 + タグフィルタ。静的書き出しと両立させるため、
 * サーバーで描画済みの全記事をクライアント側で絞り込む方式にしている。
 */
export function BlogList({ posts, tags }: { posts: BlogListItem[]; tags: string[] }) {
  const [active, setActive] = useState<string | null>(null)

  const filtered = useMemo(
    () => (active ? posts.filter((p) => p.tags.includes(active)) : posts),
    [posts, active],
  )

  return (
    <div className="space-y-8">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-pressed={active === null}
            className={chipClass(active === null)}
          >
            すべて
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(tag)}
              aria-pressed={active === tag}
              className={chipClass(active === tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <ul className="space-y-6">
        {filtered.map((post) => (
          <li key={post.slug}>
            <article className="group rounded-xl border border-neutral-200 p-5 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700">
              <Link href={`/blog/${post.slug}/`} className="block">
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  {post.hasAffiliate && (
                    <span className="rounded bg-amber-500 px-1.5 py-0.5 font-bold text-white">
                      PR
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {post.description}
                </p>
              </Link>
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <TagBadge key={tag}>{tag}</TagBadge>
                  ))}
                </div>
              )}
            </article>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-neutral-500">該当する記事はありません。</li>
        )}
      </ul>
    </div>
  )
}

function chipClass(activeState: boolean): string {
  return activeState
    ? 'rounded-full bg-neutral-900 px-3 py-1 text-sm font-medium text-white dark:bg-white dark:text-neutral-900'
    : 'rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
}
