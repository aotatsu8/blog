import { siteConfig } from '@/lib/site'

/**
 * ステマ規制対応の PR 表記。
 * hasAffiliate: true の記事で本文最上部に自動表示する。
 */
export function PrBadge() {
  return (
    <aside
      role="note"
      className="not-prose mb-8 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <span className="inline-flex shrink-0 items-center rounded bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
        PR
      </span>
      <p className="leading-relaxed">{siteConfig.affiliateDisclosure}</p>
    </aside>
  )
}
