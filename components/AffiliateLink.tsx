'use client'

import type { ReactNode } from 'react'
import { trackAffiliateClick } from '@/lib/gtag'

/**
 * 外部アフィリエイトリンク用の共通コンポーネント。
 * 検索エンジン向けに rel="sponsored nofollow" を、安全のため target/referrerPolicy を付与する。
 * クリック時に GA4 のクリックイベントを送信する（gtag 未読込なら無視）。
 *
 * TODO(計測): 将来 /go/[id] 計測リダイレクト（Cloudflare Worker）を経由させる場合は href をそちらに向ける。
 */
export function AffiliateLink({
  href,
  children,
  className,
  product,
}: {
  href: string
  children: ReactNode
  className?: string
  /** GA4 イベントに載せる商品名（任意） */
  product?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      referrerPolicy="no-referrer-when-downgrade"
      onClick={() =>
        trackAffiliateClick({
          label: typeof children === 'string' ? children : (product ?? href),
          url: href,
          product,
        })
      }
      className={
        className ??
        'font-medium text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400'
      }
    >
      {children}
    </a>
  )
}
