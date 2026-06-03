import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description: `${siteConfig.name} のプロフィールと当サイトについて。`,
  path: '/about/',
})

/** 経歴タイムライン。内容の強調は <strong> で表現する。 */
const timeline: { period: string; age: string; content: React.ReactNode }[] = [
  {
    period: '小学2年〜高校卒業',
    age: '7〜18歳',
    content: (
      <>
        <Em>野球</Em>に打ち込む（ポジション：3番・センター）
      </>
    ),
  },
  {
    period: '2011〜2013年',
    age: '18〜20歳',
    content: (
      <>
        <Em>某調理師学校</Em>で西洋料理を学ぶ
      </>
    ),
  },
  {
    period: '2013〜2021年頃',
    age: '20〜28歳',
    content: (
      <>
        <Em>都内のフレンチレストラン数店舗</Em>
        で勤務。ミシュラン星付きの店での経験もあり。<Em>ソムリエの資格も取得</Em>
      </>
    ),
  },
  {
    period: '2021〜2025年頃',
    age: '28〜32歳',
    content: (
      <>
        <Em>コロナをきっかけにIT業界へ転職</Em>（中小IT企業／開発・実務・4年）
      </>
    ),
  },
  {
    period: '2025年〜現在',
    age: '32〜33歳',
    content: (
      <>
        <Em>フリーランス フロントエンドエンジニア</Em>（1年）
      </>
    ),
  },
]

/** 強調テキスト（太字・前景色を強める） */
function Em({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
      {children}
    </strong>
  )
}

export default function AboutPage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <h1>About</h1>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left dark:border-neutral-600">
              <th className="py-3 pr-4 font-semibold">時期（目安）</th>
              <th className="py-3 pr-4 font-semibold">年齢</th>
              <th className="py-3 font-semibold">内容</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((row) => (
              <tr
                key={row.period}
                className="border-b border-neutral-200 align-top dark:border-neutral-800"
              >
                <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-400">
                  {row.period}
                </td>
                <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-400">
                  {row.age}
                </td>
                <td className="py-3 leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {row.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
