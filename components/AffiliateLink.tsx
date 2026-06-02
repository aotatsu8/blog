import type { ReactNode } from 'react'

/**
 * 外部アフィリエイトリンク用の共通コンポーネント。
 * 検索エンジン向けに rel="sponsored nofollow" を、安全のため target/referrerPolicy を付与する。
 *
 * TODO(計測): 将来 onClick で GA4 の外部リンククリックイベントを送信する。
 *   静的書き出しのため計測リダイレクト (/go/[id]) は Cloudflare Pages Functions で別途実装予定。
 *   例: gtag('event', 'affiliate_click', { link_url: href })
 */
export function AffiliateLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      referrerPolicy="no-referrer-when-downgrade"
      className={
        className ??
        'font-medium text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400'
      }
    >
      {children}
    </a>
  )
}
