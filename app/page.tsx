import Link from 'next/link'
import { siteConfig } from '@/lib/site'
import { getAllContent } from '@/lib/content'

export default function HomePage() {
  // 最新記事を数件だけトップに表示する（ビルド時取得）
  const recentPosts = getAllContent('blog').slice(0, 2)

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
          Frontend Engineer / Freelance
        </p>
        <div className="flex items-center gap-3">
          {/* サイトのロゴマーク（favicon と共通の SVG） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt=""
            width={48}
            height={48}
            className="rounded-xl sm:h-14 sm:w-14"
          />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {siteConfig.name}
          </h1>
        </div>
        <p className="max-w-prose whitespace-pre-line leading-relaxed text-neutral-600 dark:text-neutral-300">
          {siteConfig.description}
        </p>
        <div className="flex flex-wrap gap-3 pt-2 text-sm">
          <Link
            href="/blog/"
            className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            記事を読む
          </Link>
          <Link
            href="/about/"
            className="rounded-md border border-neutral-300 px-4 py-2 font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            プロフィール
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight">最新の記事</h2>
          <Link
            href="/blog/"
            className="text-sm text-sky-600 hover:text-sky-500 dark:text-sky-400"
          >
            すべて見る →
          </Link>
        </div>
        <ul className="space-y-4">
          {recentPosts.map(({ slug, frontmatter }) => (
            <li key={slug}>
              <Link
                href={`/blog/${slug}/`}
                className="group block rounded-xl border border-neutral-200 p-5 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
              >
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <time dateTime={frontmatter.date}>{frontmatter.date}</time>
                  {frontmatter.hasAffiliate && (
                    <span className="rounded bg-amber-500 px-1.5 py-0.5 font-bold text-white">
                      PR
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400">
                  {frontmatter.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {frontmatter.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
