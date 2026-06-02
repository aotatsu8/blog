'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

/** ライト/ダークを切り替えるボタン。マウント前は hydration ミスマッチ回避のため非表示。 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label="テーマを切り替える"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
    >
      {/* マウント前はアイコンを出さず、レイアウトだけ確保する */}
      {mounted ? (isDark ? '☀️' : '🌙') : <span className="opacity-0">·</span>}
    </button>
  )
}
