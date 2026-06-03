'use client'

import { trackAffiliateClick } from '@/lib/gtag'

/**
 * 商品紹介カード。画像・特徴と、各ストア（Amazon/楽天/Yahoo!）へのCTAボタンを表示する。
 * 各ボタンは rel="sponsored nofollow" 付きの外部リンクで、クリックを GA4 で計測する。
 * ストアURLが1つも無い場合は「リンク準備中」を表示（ダミー先に飛ばさない）。
 *
 * MDX 例:
 *   <ProductCard
 *     title="〇〇キーボード"
 *     image="/products/keyboard.jpg"
 *     description="打鍵感の良い定番モデル。"
 *     amazon="https://amzn.to/xxxx"
 *     rakuten="https://hb.afl.rakuten.co.jp/xxxx"
 *     yahoo="https://..."
 *   />
 */
type ProductCardProps = {
  title: string
  image?: string
  description?: string
  amazon?: string
  rakuten?: string
  yahoo?: string
  /** ストア別URLが無い場合の汎用リンク（任意） */
  href?: string
}

type Store = { key: string; label: string; url: string; className: string }

const STORE_BASE =
  'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90'

export function ProductCard({
  title,
  image,
  description,
  amazon,
  rakuten,
  yahoo,
  href,
}: ProductCardProps) {
  const stores: Store[] = [
    amazon && { key: 'amazon', label: 'Amazonで見る', url: amazon, className: `${STORE_BASE} bg-[#ff9900] !text-black` },
    rakuten && { key: 'rakuten', label: '楽天で見る', url: rakuten, className: `${STORE_BASE} bg-[#bf0000]` },
    yahoo && { key: 'yahoo', label: 'Yahoo!で見る', url: yahoo, className: `${STORE_BASE} bg-[#ff0033]` },
    !amazon && !rakuten && !yahoo && href
      ? { key: 'default', label: '詳細を見る', url: href, className: `${STORE_BASE} bg-neutral-900 dark:bg-white dark:!text-neutral-900` }
      : null,
  ].filter(Boolean) as Store[]

  return (
    <div className="not-prose my-6 flex flex-col gap-4 rounded-xl border border-neutral-200 p-4 sm:flex-row dark:border-neutral-800">
      {image && (
        // 商品画像。静的書き出しのため最適化なしの素の img を使用。
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title}
          className="h-32 w-full shrink-0 rounded-md object-contain sm:w-32"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}

        <div className="mt-auto pt-3">
          {stores.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stores.map((store) => (
                <a
                  key={store.key}
                  href={store.url}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  referrerPolicy="no-referrer-when-downgrade"
                  onClick={() =>
                    trackAffiliateClick({
                      label: store.label,
                      url: store.url,
                      product: title,
                      store: store.key,
                    })
                  }
                  className={store.className}
                >
                  {store.label}
                </a>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center rounded-md border border-dashed border-neutral-300 px-3 py-1.5 text-sm text-neutral-400 dark:border-neutral-700">
              リンク準備中
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
