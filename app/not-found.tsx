import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">404 — ページが見つかりません</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="inline-block text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
      >
        トップへ戻る
      </Link>
    </div>
  )
}
