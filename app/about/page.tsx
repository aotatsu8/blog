import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description: `${siteConfig.name} のプロフィールと当サイトについて。`,
  path: '/about/',
})

export default function AboutPage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <h1>About</h1>
      <p>
        フリーランスのフロントエンドエンジニアとして、Web
        アプリケーションのUI設計・実装を中心に活動しています。React / Next.js /
        TypeScript を得意とし、パフォーマンスとアクセシビリティに配慮した実装を心がけています。
      </p>

      <h2>スキル</h2>
      <ul>
        <li>フロントエンド: React, Next.js, TypeScript, Tailwind CSS</li>
        <li>設計: コンポーネント設計, デザインシステム, SEO/パフォーマンス改善</li>
        <li>その他: アクセシビリティ, CI/CD, 静的サイト配信</li>
      </ul>

      <h2>お問い合わせ</h2>
      <p>
        お仕事のご相談は{' '}
        <a href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer">
          X / Twitter
        </a>{' '}
        または{' '}
        <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{' '}
        からご連絡ください。
      </p>

      {/* ステマ規制対応: サイト共通のアフィリエイト開示（フッターと併せて明示） */}
      <h2 id="affiliate">アフィリエイトに関する表示</h2>
      <p>{siteConfig.affiliateDisclosure}</p>
      <p>
        各記事のうち広告（アフィリエイトリンク）を含むものには、記事冒頭に「PR」表記を掲載しています。
        商品・サービスの紹介は実際の利用体験や調査に基づいて行っていますが、
        最終的なご判断は各公式サイトの情報をご確認のうえお願いいたします。
      </p>
    </article>
  )
}
