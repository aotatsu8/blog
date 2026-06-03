# Personal Site

技術 × 旅 × カフェ × 日常 を綴る個人ブログ。
**完全静的書き出し（`output: 'export'`）** の Next.js サイトで、Cloudflare 上に無料で配信しています。
Qiita 投稿の自動取り込みと、アフィリエイト記事による収益化に対応しています。

- 本番URL: https://blog.aotatsu7.workers.dev

## 技術スタック

| 領域 | 採用技術 |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| 書き出し | `output: 'export'`（静的書き出し → `out/`、`trailingSlash: true`） |
| スタイル | Tailwind CSS v4 + `@tailwindcss/typography` |
| ダークモード | next-themes（class 戦略） |
| コンテンツ | MDX（`/content` 配下、frontmatter 付き）+ gray-matter + next-mdx-remote/rsc |
| Markdown 拡張 | remark-gfm / rehype-slug / rehype-pretty-code (shiki) |
| frontmatter 検証 | zod |
| 計測 | Google Analytics 4 |
| ホスティング | Cloudflare（Worker の静的アセット配信） |
| パッケージマネージャ | pnpm |

## セットアップ

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

### ビルド（静的書き出し）

```bash
pnpm build      # out/ に静的HTMLを生成
pnpm preview    # out/ をローカルHTTPサーバーで配信して確認
```

`pnpm build` が成功すると、`out/` 配下に全ページの HTML・`sitemap.xml`・`robots.txt` が生成されます。

> ⚠️ **`out/index.html` をブラウザで直接開かないでください（`file://`）。**
> 静的書き出しは CSS/JS を `/_next/...` の絶対パスで読み込むため、ファイルを直接開くと
> アセットが解決できずスタイルが当たらず**レイアウトが崩れて見えます**。
> 必ず `pnpm preview`（または任意の静的サーバー）経由の `http://localhost:...` で確認してください。
> 本番（ドメインルート配信）では問題ありません。

## 環境変数

サイト設定は [`lib/site.ts`](lib/site.ts) に集約しており、以下は**環境変数があれば優先・無ければコードの既定値**を使います（`.env.example` 参照）。

| 変数 | 説明 | 既定値（lib/site.ts） |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | 本番サイトの絶対URL（canonical / OGP / sitemap）。末尾スラッシュなし | `https://blog.aotatsu7.workers.dev` |
| `NEXT_PUBLIC_GA_ID` | GA4 測定ID（例: `G-XXXXXXXXXX`）。空なら GA 無効 | `G-XJM92T2YDX` |

> 独自ドメイン導入時は `NEXT_PUBLIC_SITE_URL` を設定して上書きしてください。

## ディレクトリ構成

```
app/         ルーティング（App Router）。sitemap.ts / robots.ts を含む
components/   UI コンポーネント（Header/Footer/ProductCard/AffiliateLink 等）
content/blog/ MDX コンテンツ（記事。手書き記事＋Qiita取り込み記事）
lib/         site設定・コンテンツローダ・MDX/SEO/GA ヘルパ・zodスキーマ
scripts/     Qiita 取り込みスクリプト
functions/   Cloudflare Functions のプレースホルダ（将来の /go 計測リダイレクト用）
public/      静的アセット（icon.svg ほか）
.github/workflows/ Qiita 自動同期（GitHub Actions）
wrangler.jsonc     Cloudflare で out/ を静的配信するための設定
```

### ルート（ページ）

| パス | 内容 |
|---|---|
| `/` | トップ（自己紹介＋最新記事） |
| `/blog/` | 記事一覧（カテゴリで絞り込み） |
| `/blog/[slug]/` | 記事詳細（`generateStaticParams`） |
| `/about/` | 運営者情報・経歴タイムライン・アフィリエイト表示 |
| `/privacy/` | プライバシーポリシー（GA4/Cookie・アフィリエイト・免責 等） |
| お問い合わせ | 外部 Google フォーム（フッターから別タブで開く。ページは持たない） |

## コンテンツの追加

`content/blog/*.mdx` を追加するだけでページが生成されます（ファイル名 = slug）。
frontmatter は [`lib/schema.ts`](lib/schema.ts) の zod スキーマで検証され、不正な場合はビルドが失敗します。

### 記事の frontmatter

```yaml
---
title: 'タイトル'
description: '説明（meta description / OGP に使用）'
date: '2026-05-20'
updated: '2026-05-30'      # 任意
category: 'IT'             # 必須。IT / 日常 / 旅 / グルメ / work から1つ
tags: ['Next.js', 'TypeScript']  # 任意。記事内に表示する細かいタグ（絞り込みには非使用）
ogImage: '/og/foo.png'     # 任意。未指定はサイト共通デフォルト
sourceUrl: 'https://qiita.com/...'  # 任意。出典（転載元）リンクを記事に表示
sourceName: 'Qiita'        # 任意。出典リンクのラベル
hasAffiliate: true         # アフィリリンクを含む記事は true → 冒頭に「PR」表記を自動表示
draft: false               # 任意。true で一覧から除外
---
```

> **カテゴリ（`category`）と絞り込み**
> 一覧の絞り込みは固定の5カテゴリ **`IT` / `日常` / `旅` / `グルメ` / `work`**（[`lib/schema.ts`](lib/schema.ts) の `BLOG_CATEGORIES`）で行います。
> 各記事に1つ必須です。**Qiita から取り込んだ記事は自動的に `IT`** になります。
> 手書き記事は投稿時に適切なカテゴリを指定してください（未指定や5種以外はビルドエラー）。

### MDX で使えるコンポーネント

本文中で以下が使えます（クリックは GA4 イベント `affiliate_click` で計測。[`lib/gtag.ts`](lib/gtag.ts)）。

```mdx
{/* テキストリンク */}
<AffiliateLink href="https://...">商品名はこちら</AffiliateLink>

{/* 商品カード（画像＋各ストアのCTAボタン）。URLを1つも渡さないと「リンク準備中」表示 */}
<ProductCard
  title="〇〇キーボード"
  image="https://example.com/img.jpg"
  description="打鍵感の良い定番モデル。"
  amazon="https://..."
  rakuten="https://..."
  yahoo="https://..."
/>
```

いずれの外部リンクにも `rel="sponsored nofollow noopener"` / `target="_blank"` / `referrerPolicy` を自動付与します。
コンポーネントの登録は [`lib/mdx.tsx`](lib/mdx.tsx) の components マップで行っています。

## Qiita 記事の取り込み（同期）

Qiita の投稿をブログ記事として取り込めます。

```bash
pnpm import:qiita            # 既定ユーザー(aotatsu8)の記事を取得
pnpm import:qiita <user>     # ユーザー指定
```

- [`scripts/import-qiita.mjs`](scripts/import-qiita.mjs) が Qiita API v2 で記事を取得し、
  `content/blog/qiita-<記事ID>.mdx` を生成します（**再実行で上書き同期**。Qiita 側で削除された記事も追従）。
- `category: 'IT'` を自動付与。`sourceUrl` に元記事URLが入り、記事に「Qiita にも掲載しています」リンクを表示します。
- MDX で誤解釈される `{ } <タグ`（コード外）は自動エスケープ。本文先頭の重複タイトル見出しは自動除去します。

> ⚠️ 取り込んだ MDX を手で編集しても、再 `import:qiita` で**上書きされます**。
> 恒久的に手を入れたい記事は、ファイル名から `qiita-` プレフィックスを外して別 slug にしてください。

### 自動同期（GitHub Actions）

[`.github/workflows/sync-qiita.yml`](.github/workflows/sync-qiita.yml) が **毎日 09:00 JST**（手動実行も可）に
`import:qiita` を実行し、差分があれば `content/blog/` をコミット＆push します。
push をトリガーに Cloudflare が自動で再デプロイします。

## アフィリエイト / ステマ規制対応

- `hasAffiliate: true` の記事は本文冒頭に「PR」バッジ（[`components/PrBadge.tsx`](components/PrBadge.tsx)）を**自動表示**。
- サイト共通のアフィリエイト利用開示を **フッター** ・ **[/privacy](app/privacy/page.tsx)** ・ **[/about](app/about/page.tsx)** に記載。
- Amazonアソシエイト必須表記（`amazonAssociateDisclosure`）と開示文（`affiliateDisclosure`）は [`lib/site.ts`](lib/site.ts) で一元管理。

## 計測（GA4）

- [`components/Analytics.tsx`](components/Analytics.tsx) が `siteConfig.gaId` を `next/script` で読み込み（空なら無効）。
- アフィリエイトリンク/商品カードのクリックで GA4 カスタムイベント **`affiliate_click`**（`link_url` / `link_text` / `item_name` / `store`）を送信（[`lib/gtag.ts`](lib/gtag.ts)）。

## SEO

- 各ページで `generateMetadata`（title / description / canonical / OGP / Twitter card）。[`lib/seo.ts`](lib/seo.ts)
- JSON-LD: 記事 → `Article` + `BreadcrumbList`。
- `app/sitemap.ts` / `app/robots.ts` を静的生成。

## デプロイ（Cloudflare）

GitHub リポジトリを Cloudflare に接続し、push のたびに自動ビルド・デプロイされます。
本サイトは**静的書き出しを Worker の静的アセットとして配信**しています。

| 設定項目 | 値 |
|---|---|
| Build command | `pnpm build` |
| Deploy command | `npx wrangler deploy` |
| 配信内容 | [`wrangler.jsonc`](wrangler.jsonc) の `assets.directory = ./out` |

> ⚠️ **`wrangler.jsonc` は必須です。** これが無いと `wrangler deploy` が Next.js を検知して
> OpenNext(SSR) へ自動移行し、`output: 'export'` と噛み合わずビルドが失敗します。
> `wrangler.jsonc`（`assets.directory: ./out`）を置くことで `out/` をそのまま静的配信します。

ローカルから手動で出す場合は `npx wrangler deploy`（要 `npx wrangler login`）。

## TODO（将来対応）

- **OGP デフォルト画像** — `public/og-default.png`（1200×630）が未配置。SNS シェアの見栄え向上のため要追加。
- **`/go/[id]` クリック計測リダイレクト** — 未実装。Cloudflare Functions で対応予定（[`functions/README.md`](functions/README.md) に雛形）。
- **Cookie 同意バナー** — 未実装。Google AdSense 併用や EU 対応が必要になったら追加。
- **動的 OGP 画像生成** — 現状は frontmatter 指定の静的画像 / サイト共通デフォルト。
