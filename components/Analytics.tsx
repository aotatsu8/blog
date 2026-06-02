import Script from 'next/script'

/**
 * GA4 を環境変数 NEXT_PUBLIC_GA_ID で差し込む。未設定なら何も描画せず無効化する。
 *
 * TODO(計測): 外部リンク / アフィリエイトリンクのクリックイベント送信は
 *   各リンクコンポーネント側（例: AffiliateLink）の onClick から gtag('event', ...) で行う。
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
