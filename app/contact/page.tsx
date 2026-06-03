import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'お問い合わせ',
  description: `${siteConfig.name} へのお問い合わせはこちらから。`,
  path: '/contact/',
})

export default function ContactPage() {
  const hasForm = siteConfig.contactFormAction.length > 0

  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <h1>お問い合わせ</h1>
      <p>
        記事へのご指摘、お仕事・提携のご相談などは、以下のフォームまたはメールよりご連絡ください。
        内容を確認のうえ、順次返信いたします。
      </p>

      {hasForm ? (
        // contactFormAction（Formspree 等）が設定されている場合は実フォームを表示。
        // 静的書き出しでも動く素の HTML フォーム（外部サービスへ POST）。
        <form
          action={siteConfig.contactFormAction}
          method="POST"
          className="not-prose space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              お名前
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              お問い合わせ内容
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            送信する
          </button>
        </form>
      ) : (
        // フォーム未設定時はメール問い合わせにフォールバック
        <>
          <p>
            メールでのお問い合わせは{' '}
            <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('【お問い合わせ】' + siteConfig.name)}`}>
              {siteConfig.email}
            </a>{' '}
            までお願いします。
          </p>
          <p>
            あるいは{' '}
            <a href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer">
              X / Twitter
            </a>{' '}
            のDMでもご連絡いただけます。
          </p>
        </>
      )}
    </article>
  )
}
