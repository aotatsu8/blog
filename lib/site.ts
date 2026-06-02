/**
 * サイト全体で共有する設定値。
 * 本番 URL は環境変数 NEXT_PUBLIC_SITE_URL から取得し、未設定時はプレースホルダを使う。
 */

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://example.com'

export const siteConfig = {
  name: 'Tatsuya Aoki',
  /** ブラウザタブやメタタイトルのサフィックスに使う短い肩書き */
  title: 'Tatsuya Aoki — Frontend Engineer',
  description:
    'フリーランスのフロントエンドエンジニア。技術記事や知見をまとめた個人サイトです。',
  url: rawSiteUrl,
  locale: 'ja_JP',
  /** OGP のデフォルト画像（/public 配下の静的画像を指す） */
  defaultOgImage: '/og-default.png',
  author: {
    name: 'Tatsuya Aoki',
    /** Twitter card の creator に使用（@ なし） */
    twitter: 'your_handle',
  },
  social: {
    github: 'https://github.com/your-handle',
    twitter: 'https://twitter.com/your_handle',
  },
  /** ステマ規制対応: サイト共通のアフィリエイト利用開示文 */
  affiliateDisclosure:
    '当サイトはアフィリエイトプログラム（Amazonアソシエイト等）を利用しており、一部のリンクから収益を得ています。',
} as const

/** ヘッダー/フッターのナビゲーション項目 */
export const navItems = [
  { href: '/blog/', label: 'Blog' },
  { href: '/about/', label: 'About' },
] as const

/** 相対パスをサイト絶対 URL に変換する */
export function absoluteUrl(path = ''): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url}${normalized}`
}
