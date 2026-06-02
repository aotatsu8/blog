import Link from 'next/link'
import { navItems, siteConfig } from '@/lib/site'
import { ThemeToggle } from './ThemeToggle'

/** サイト共通ヘッダー。ロゴ・ナビゲーション・テーマトグルを表示する。 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/80 backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="font-bold tracking-tight">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-1 sm:gap-4">
          <nav className="flex items-center gap-3 text-sm sm:gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
