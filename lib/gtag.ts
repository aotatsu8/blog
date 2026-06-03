/**
 * GA4 イベント送信ヘルパ（クライアント専用）。
 * gtag が未読込（NEXT_PUBLIC_GA_ID 未設定など）の場合は何もしない。
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>,
    ) => void
  }
}

export type AffiliateClickPayload = {
  /** クリックされたリンク/ボタンのテキスト */
  label: string
  /** 遷移先 URL */
  url: string
  /** 商品名（任意） */
  product?: string
  /** ストア名（amazon / rakuten / yahoo など。任意） */
  store?: string
}

/** アフィリエイトリンクのクリックを GA4 のカスタムイベントとして送信する */
export function trackAffiliateClick(payload: AffiliateClickPayload): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'affiliate_click', {
    link_text: payload.label,
    link_url: payload.url,
    item_name: payload.product,
    store: payload.store,
  })
}
