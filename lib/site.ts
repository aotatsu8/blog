/**
 * サイト全体で共有する設定値。
 * 本番 URL は環境変数 NEXT_PUBLIC_SITE_URL から取得し、未設定時はプレースホルダを使う。
 */

// 本番URL。環境変数 NEXT_PUBLIC_SITE_URL があればそれを優先（将来の独自ドメイン用）、
// 無ければ現在の本番URLを既定値として使う。
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://blog.aotatsu7.workers.dev'

export const siteConfig = {
  name: 'Hachi',
  /** ブラウザタブやメタタイトルのサフィックスに使う短い肩書き */
  title: 'Hachi — Frontend Engineer',
  description: [
    'Hachiです。フリーランスでフロントエンドをやってます。',
    'このブログでは、旅に行ったり、カフェ巡りしたり、日々の気づきや好きなことをゆるく綴っています。',
    'プログラミングやエンジニアの疑問はQiitaに投稿しているので、気になったらのぞいてみてください。',
  ].join('\n'),
  url: rawSiteUrl,
  locale: 'ja_JP',
  /**
   * GA4 測定ID（G-XXXXXXXXXX）。環境変数 NEXT_PUBLIC_GA_ID があれば優先。
   * 無ければここに直接書いてもよい（測定IDは公開情報なので秘匿不要）。空なら GA 無効。
   */
  gaId: process.env.NEXT_PUBLIC_GA_ID || 'G-XJM92T2YDX',
  /** OGP のデフォルト画像（/public 配下の静的画像を指す） */
  defaultOgImage: '/og-default.png',
  author: {
    name: 'Hachi',
    /** Twitter card の creator に使用（@ なし） */
    twitter: 'your_handle',
  },
  social: {
    github: 'https://github.com/aotatsu8',
    twitter: 'https://twitter.com/TatsuyaAok8',
    qiita: 'https://qiita.com/aotatsu8',
    instagram: 'https://www.instagram.com/aotatsuhachi8/',
  },
  /**
   * お問い合わせ用 Google フォームの単体表示URL（別タブで開く用）。
   * 埋め込み用の `?embedded=true` は付けない。
   */
  contactFormUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSc8Hdd_1DGqjbNDKxCcaErOHMDZMzFT68I7EulqtWlh3Ri95A/viewform',
  /** ステマ規制対応: サイト共通のアフィリエイト利用開示文 */
  affiliateDisclosure:
    '当サイトはアフィリエイトプログラム（Amazonアソシエイト等）を利用しており、一部のリンクから収益を得ています。',
} as const

/**
 * Amazon等の物販アフィリエイト利用の開示文。
 * 当サイトはAmazonアソシエイトに直接加入しておらず、「もしもアフィリエイト」経由で
 * Amazon.co.jp等の商品を紹介しているため、直接会員専用の必須文言ではなく実態に即した表現にする。
 */
export const amazonAssociateDisclosure = `当サイトは「もしもアフィリエイト」をはじめとするアフィリエイトプログラムを通じて、Amazon.co.jp や楽天市場等の商品を紹介し、紹介料を得ています。`

/** ヘッダー/フッターのナビゲーション項目 */
export const navItems = [
  { href: '/blog/', label: 'Blog' },
  { href: '/about/', label: 'About' },
] as const

/** フッターに置く規約・運営関連リンク（external は別タブで開く外部リンク） */
export const legalNavItems = [
  { href: '/about/', label: '運営者情報', external: false },
  { href: '/privacy/', label: 'プライバシーポリシー', external: false },
  { href: siteConfig.contactFormUrl, label: 'お問い合わせ', external: true },
] as const

/** 相対パスをサイト絶対 URL に変換する */
export function absoluteUrl(path = ''): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url}${normalized}`
}
