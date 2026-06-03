import Link from 'next/link'
import { siteConfig, legalNavItems } from '@/lib/site'

/** サイト共通フッター。アフィリエイト利用の開示文をサイト全体で常時表示する。 */
export function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm text-neutral-500 dark:text-neutral-400">
        {/* ステマ規制対応: サイト共通のアフィリエイト開示。詳細はプライバシーポリシーに記載。 */}
        <p className="leading-relaxed">
          {siteConfig.affiliateDisclosure}{' '}
          <Link href="/privacy/" className="underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-200">
            詳細はこちら
          </Link>
        </p>

        {/* 規約・運営関連ページ（ASP審査・法令対応の導線） */}
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {legalNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-200">
            GitHub
          </a>
          <a href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-200">
            X / Twitter
          </a>
          <a href={siteConfig.social.qiita} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-200">
            Qiita
          </a>
        </div>
        <p>
          © {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
