#!/usr/bin/env node
/**
 * Qiita の投稿を取得して content/blog/*.mdx として書き出す同期スクリプト。
 *
 * 使い方:
 *   node scripts/import-qiita.mjs <qiita_user>   (省略時は QIITA_USER env、既定 'aotatsu8')
 *
 * - ファイル名は `qiita-<itemId>.mdx`（安定 slug）。再実行で上書き同期する。
 * - frontmatter の `sourceUrl` に元記事URLを入れ、記事ページに出典リンクを表示する。
 * - MDX で誤解釈される `{ } < タグ` をコード外のみ自動エスケープする。
 *
 * 認証なしのため API レート制限（60req/h/IP）に注意。
 */
import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'

const USER = process.argv[2] || process.env.QIITA_USER || 'aotatsu8'
const OUT_DIR = path.join(process.cwd(), 'content', 'blog')
const PREFIX = 'qiita-'

/** YAML のシングルクォート文字列としてエスケープ（' を '' に） */
function yamlStr(s) {
  return `'${String(s).replace(/'/g, "''")}'`
}

/** 本文 Markdown から meta description 用の短い説明文を生成 */
function makeDescription(body) {
  let t = body
  t = t.replace(/```[\s\S]*?```/g, ' ') // フェンスコード除去
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 画像
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンク -> テキスト
  t = t.replace(/`([^`]*)`/g, '$1') // インラインコード -> テキスト
  t = t.replace(/^\s{0,3}#{1,6}\s+/gm, '') // 見出し記号
  t = t.replace(/[>*_~|]/g, ' ') // 装飾記号
  t = t.replace(/\s+/g, ' ').trim()
  const sliced = t.slice(0, 90)
  return t.length > 90 ? `${sliced}…` : sliced
}

/**
 * 本文先頭の重複タイトル見出し（H1）を除去する。
 * ページ側でタイトルを大見出しとして表示するため、本文先頭の H1 は二重になりやすい。
 * ただし句点で終わる/長い見出しは「本文の一文」とみなして残す（内容欠落を防ぐ）。
 */
function stripLeadingTitle(body) {
  const lines = body.split('\n')
  let i = 0
  while (i < lines.length && lines[i].trim() === '') i++
  const m = lines[i]?.match(/^#\s+(.*)$/)
  if (!m) return { body, stripped: null }
  const heading = m[1].trim()
  // 句点で終わる（＝本文の一文）か、長すぎる見出しは残す。疑問形タイトル（〜？）は除去対象。
  if (heading.length > 50 || /。$/.test(heading)) return { body, stripped: null }
  lines.splice(i, 1)
  if (lines[i] !== undefined && lines[i].trim() === '') lines.splice(i, 1)
  return { body: lines.join('\n'), stripped: heading }
}

/** コード外のみ {,},<タグ をバックスラッシュでエスケープして MDX 安全にする */
function sanitizeForMdx(src) {
  const lines = src.split('\n')
  const out = []
  let inFence = false
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      out.push(line)
      continue
    }
    if (inFence) {
      out.push(line)
      continue
    }
    // インラインコード ` ... ` は触らず、それ以外を escape
    const escaped = line
      .split(/(`[^`]*`)/g)
      .map((part) =>
        part.startsWith('`')
          ? part
          : part.replace(/[{}]/g, (m) => `\\${m}`).replace(/<(?=[A-Za-z/!])/g, '\\<'),
      )
      .join('')
    out.push(escaped)
  }
  return out.join('\n')
}

function toMdx(item) {
  const created = item.created_at.slice(0, 10)
  const updated = item.updated_at.slice(0, 10)
  const tags = item.tags.map((t) => yamlStr(t.name)).join(', ')
  // 説明文は元の全文から（タイトル文を含めて意味のある要約に）、本文は重複H1を除去
  const { body, stripped } = stripLeadingTitle(item.body)

  const fm = [
    '---',
    `title: ${yamlStr(item.title)}`,
    `description: ${yamlStr(makeDescription(item.body))}`,
    `date: '${created}'`,
    ...(updated !== created ? [`updated: '${updated}'`] : []),
    `tags: [${tags}]`,
    `sourceUrl: ${yamlStr(item.url)}`,
    `sourceName: 'Qiita'`,
    'hasAffiliate: false',
    '---',
    '',
  ].join('\n')

  return { mdx: `${fm}${sanitizeForMdx(body).trim()}\n`, stripped }
}

async function main() {
  const res = await fetch(
    `https://qiita.com/api/v2/users/${encodeURIComponent(USER)}/items?per_page=100`,
    { headers: { Accept: 'application/json' } },
  )
  if (!res.ok) {
    throw new Error(`Qiita API error: ${res.status} ${res.statusText}`)
  }
  const items = await res.json()
  if (!Array.isArray(items)) {
    throw new Error(`Unexpected response: ${JSON.stringify(items).slice(0, 200)}`)
  }

  await mkdir(OUT_DIR, { recursive: true })

  // 既存の取り込み分を一旦削除し、Qiita 側で削除された記事も同期する
  const existing = await readdir(OUT_DIR)
  await Promise.all(
    existing
      .filter((f) => f.startsWith(PREFIX) && f.endsWith('.mdx'))
      .map((f) => unlink(path.join(OUT_DIR, f))),
  )

  for (const item of items) {
    const file = path.join(OUT_DIR, `${PREFIX}${item.id}.mdx`)
    const { mdx, stripped } = toMdx(item)
    await writeFile(file, mdx, 'utf8')
    const note = stripped ? `  [先頭H1を除去: ${stripped}]` : ''
    console.log(`wrote ${path.relative(process.cwd(), file)}  (${item.title})${note}`)
  }
  console.log(`\nDone: imported ${items.length} article(s) from @${USER}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
