#!/usr/bin/env node
/**
 * 新規ブログ記事を X（旧Twitter）へ投稿する / 投稿下書きを生成するスクリプト。
 *
 * 依存ゼロ（Node 標準 API のみ）で動く。frontmatter は簡易パーサで読む。
 *
 * 使い方:
 *   ADDED_FILES に「追加された mdx のパス（改行区切り）」を渡して実行する。
 *   （GitHub Actions では push 差分の追加ファイルを git diff で拾って渡す）
 *
 *   # ローカル確認（引数でパスを渡してもよい。何もせず投稿文を表示するだけ）
 *   node scripts/post-to-x.mjs content/blog/staub-cocotte-round-20cm.mdx
 *
 * モード（環境変数 POST_MODE）:
 *   - 'draft'（既定）… 投稿文を生成し、GitHub Issue に下書きとして起票する。
 *                       写真を足して人間が手動投稿する運用（伸びやすい・推奨）。
 *   - 'live'  … X API v2 POST /2/tweets で即投稿する（OAuth 1.0a user context）。
 *
 * 投稿対象の絞り込み（このリポジトリのルール）:
 *   - content/blog/*.mdx のみ
 *   - qiita-*.mdx は除外（IT記事・重複コンテンツ）
 *   - draft: true は除外
 *
 * 必要な環境変数:
 *   draft モード: GITHUB_TOKEN, GITHUB_REPOSITORY（Actions が自動付与）
 *   live  モード: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
 */
import { readFile } from 'node:fs/promises'
import crypto from 'node:crypto'
import path from 'node:path'

// ---- 設定 -----------------------------------------------------------------

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.aotatsu7.workers.dev').replace(/\/$/, '')
const MODE = (process.env.POST_MODE || 'draft').toLowerCase()
const BLOG_DIR = 'content/blog'
const TWEET_MAX_WEIGHTED = 280 // X の重み付き上限
const URL_WEIGHT = 23 // t.co 短縮後は全URL一律 23 として数える

/** カテゴリ → ハッシュタグ（1個目に使う）*/
const CATEGORY_HASHTAG = {
  'グルメ': 'グルメ',
  '日常': '暮らし',
  '旅': '旅行',
  'work': '働き方',
  'IT': 'プログラミング',
}

// ---- frontmatter 簡易パーサ -------------------------------------------------

/**
 * mdx 文字列の先頭 frontmatter（--- で囲まれた YAML）から必要フィールドを読む。
 * 対応するのは title/description/date/category/tags/draft/hasAffiliate/ogImage の最小構文のみ。
 */
function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const out = {}
  for (const rawLine of m[1].split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, '')
    if (!line || /^\s/.test(rawLine) && !line.includes(':')) continue
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!kv) continue
    const key = kv[1]
    let val = kv[2].trim()
    if (val === '') continue
    // 配列 ['a', 'b'] 形式
    if (val.startsWith('[') && val.endsWith(']')) {
      out[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => unquote(s.trim()))
        .filter(Boolean)
      continue
    }
    // 真偽値
    if (val === 'true' || val === 'false') {
      out[key] = val === 'true'
      continue
    }
    out[key] = unquote(val)
  }
  return out
}

/** 前後のクォートを外す（YAML の '' エスケープも戻す）*/
function unquote(s) {
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    const body = s.slice(1, -1)
    return s[0] === "'" ? body.replace(/''/g, "'") : body
  }
  return s
}

// ---- 投稿文の生成 -----------------------------------------------------------

/** X の重み付き文字数（CJK など全角は 2、半角は 1、URL は一律 URL_WEIGHT）を概算 */
function weightedLength(text) {
  // まず URL を除いた本文の重みを数え、URL 出現ごとに URL_WEIGHT を足す
  const urlRe = /https?:\/\/\S+/g
  let base = 0
  let urls = 0
  let lastIndex = 0
  let match
  const addWeight = (chunk) => {
    for (const ch of chunk) {
      const cp = ch.codePointAt(0)
      // 半角英数記号・改行などは 1、それ以外（全角/CJK/絵文字）は 2 とみなす
      base += cp <= 0x2122 ? 1 : 2
    }
  }
  while ((match = urlRe.exec(text)) !== null) {
    addWeight(text.slice(lastIndex, match.index))
    urls += 1
    lastIndex = urlRe.lastIndex
  }
  addWeight(text.slice(lastIndex))
  return base + urls * URL_WEIGHT
}

/** description から冒頭のフック文（1文）を取り出し、長ければ丸める */
function makeHook(description, maxWeighted = 90) {
  if (!description) return ''
  // 最初の句点までを 1 文として使う
  const firstSentence = description.split(/(?<=。)/)[0].trim() || description.trim()
  let hook = firstSentence
  while (weightedLength(hook) > maxWeighted && hook.length > 1) {
    hook = hook.slice(0, -1)
  }
  return hook === firstSentence ? hook : `${hook}…`
}

/** カテゴリと tags からハッシュタグ（最大2個）を作る */
function makeHashtags(fm) {
  const tags = []
  const catTag = CATEGORY_HASHTAG[fm.category]
  if (catTag) tags.push(catTag)
  if (Array.isArray(fm.tags)) {
    for (const t of fm.tags) {
      const clean = String(t).replace(/[\s#]/g, '')
      if (clean && !tags.includes(clean)) {
        tags.push(clean)
        break // tags からは1個だけ
      }
    }
  }
  return tags.slice(0, 2).map((t) => `#${t}`)
}

/** 記事の frontmatter と slug から投稿文を組み立てる */
function buildTweet(fm, slug) {
  const url = `${SITE_URL}/blog/${slug}/`
  const hashtags = makeHashtags(fm).join(' ')
  const hook = makeHook(fm.description)

  // タイトルは「｜」以降（キャッチ）を落として主題だけ残すと収まりやすい
  let title = String(fm.title || slug).split(/[|｜]/)[0].trim()

  const assemble = (t) =>
    ['【新着記事】' + t, '', hook, '', url, '', hashtags]
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === '')) // 連続空行の抑制
      .join('\n')
      .trim()

  // 上限を超えるならタイトルを縮める
  let text = assemble(title)
  while (weightedLength(text) > TWEET_MAX_WEIGHTED && title.length > 4) {
    title = title.slice(0, -1)
    text = assemble(title + '…')
  }
  return { text, url }
}

// ---- OAuth 1.0a（X API v2 直接投稿用・依存ゼロ実装）-------------------------

/** RFC3986 準拠のパーセントエンコード */
function pctEncode(str) {
  return encodeURIComponent(str).replace(/[!*'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

/**
 * OAuth 1.0a の Authorization ヘッダを生成する。
 * JSON ボディで投稿するため、署名ベース文字列にはボディを含めない（oauth_* のみ）。
 */
function buildOAuthHeader(method, url, creds) {
  const oauth = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: '1.0',
  }
  const paramString = Object.keys(oauth)
    .sort()
    .map((k) => `${pctEncode(k)}=${pctEncode(oauth[k])}`)
    .join('&')
  const baseString = [method.toUpperCase(), pctEncode(url), pctEncode(paramString)].join('&')
  const signingKey = `${pctEncode(creds.apiSecret)}&${pctEncode(creds.accessTokenSecret)}`
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')

  const header =
    'OAuth ' +
    Object.entries({ ...oauth, oauth_signature: signature })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${pctEncode(k)}="${pctEncode(v)}"`)
      .join(', ')
  return header
}

/** X API v2 で投稿する */
async function postToX(text) {
  const creds = {
    apiKey: requireEnv('X_API_KEY'),
    apiSecret: requireEnv('X_API_SECRET'),
    accessToken: requireEnv('X_ACCESS_TOKEN'),
    accessTokenSecret: requireEnv('X_ACCESS_TOKEN_SECRET'),
  }
  const url = 'https://api.x.com/2/tweets'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: buildOAuthHeader('POST', url, creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })
  const bodyText = await res.text()
  if (!res.ok) {
    throw new Error(`X API エラー ${res.status}: ${bodyText}`)
  }
  return JSON.parse(bodyText)
}

// ---- GitHub Issue 起票（下書きモード）--------------------------------------

/** GitHub Issue を作成する */
async function createIssue({ title, body }) {
  const repo = requireEnv('GITHUB_REPOSITORY') // "owner/name"
  const token = requireEnv('GITHUB_TOKEN')
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, body }),
  })
  const bodyText = await res.text()
  if (!res.ok) {
    throw new Error(`GitHub Issue 作成エラー ${res.status}: ${bodyText}`)
  }
  return JSON.parse(bodyText)
}

/** 下書き Issue の本文を組み立てる */
function issueBody(tweet, articleUrl) {
  return [
    '新しい記事が公開されました。下の投稿文をコピーし、**写真を1〜2枚添えて** X（@Hachi8blog8）へ手動投稿してください。',
    '',
    '### 投稿文（コピー用）',
    '',
    '```',
    tweet,
    '```',
    '',
    `記事URL: ${articleUrl}`,
    '',
    '### チェックリスト',
    '- [ ] 写真を添付した（商品・料理・風景など）',
    '- [ ] 投稿文を必要に応じて調整した',
    '- [ ] X に投稿した',
    '- [ ] 投稿できたらこの Issue を Close する',
    '',
    '> この Issue は push 時に自動生成されました（scripts/post-to-x.mjs）。',
  ].join('\n')
}

// ---- ユーティリティ ---------------------------------------------------------

function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`環境変数 ${name} が未設定です`)
  return v
}

/** 処理対象の mdx パス一覧を得る（ADDED_FILES env 優先、無ければ argv）*/
function getTargetPaths() {
  const fromEnv = (process.env.ADDED_FILES || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  const fromArgv = process.argv.slice(2)
  const all = fromEnv.length ? fromEnv : fromArgv
  return all.filter((p) => {
    const base = path.basename(p)
    return (
      p.replace(/\\/g, '/').startsWith(`${BLOG_DIR}/`) &&
      base.endsWith('.mdx') &&
      !base.startsWith('qiita-')
    )
  })
}

// ---- メイン -----------------------------------------------------------------

async function main() {
  const targets = getTargetPaths()
  if (targets.length === 0) {
    console.log('投稿対象の新規記事はありません（qiita-*・非mdxは除外）。')
    return
  }

  let posted = 0
  for (const filePath of targets) {
    let raw
    try {
      raw = await readFile(filePath, 'utf8')
    } catch {
      console.log(`スキップ（読めません）: ${filePath}`)
      continue
    }
    const fm = parseFrontmatter(raw)

    if (fm.draft === true) {
      console.log(`スキップ（draft: true）: ${filePath}`)
      continue
    }
    if (!fm.title) {
      console.log(`スキップ（title 無し）: ${filePath}`)
      continue
    }

    const slug = path.basename(filePath, '.mdx')
    const { text, url } = buildTweet(fm, slug)

    console.log('\n---------------------------------------------')
    console.log(`記事: ${filePath}`)
    console.log(`重み付き文字数: ${weightedLength(text)} / ${TWEET_MAX_WEIGHTED}`)
    console.log('投稿文:')
    console.log(text)

    if (MODE === 'live') {
      const result = await postToX(text)
      console.log(`✅ X へ投稿しました: id=${result?.data?.id ?? '(不明)'}`)
      posted++
    } else if (MODE === 'draft') {
      if (!process.env.GITHUB_TOKEN) {
        console.log('（ローカル実行: GITHUB_TOKEN が無いため Issue 起票はスキップ。上記が投稿文プレビューです）')
        continue
      }
      const issue = await createIssue({
        title: `X投稿下書き: ${fm.title}`,
        body: issueBody(text, url),
      })
      console.log(`✅ 下書き Issue を作成しました: #${issue.number} ${issue.html_url}`)
      posted++
    } else {
      console.log(`未知の POST_MODE: ${MODE}（'draft' か 'live' を指定）`)
    }
  }

  console.log(`\n完了: 対象 ${targets.length} 件 / 処理 ${posted} 件（モード=${MODE}）`)
}

main().catch((err) => {
  console.error('エラー:', err.message)
  process.exit(1)
})
