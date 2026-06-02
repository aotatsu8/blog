# Personal Site

フリーランス・フロントエンドエンジニアの個人サイト。
技術記事 / アフィリエイト記事を発信する、
**完全静的書き出し（`output: 'export'`）** の Next.js サイトです。

## 技術スタック

| 領域 | 採用技術 |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| 書き出し | `output: 'export'`（静的書き出し → `out/`） |
| スタイル | Tailwind CSS v4 + `@tailwindcss/typography` |
| ダークモード | next-themes（class 戦略） |
| コンテンツ | MDX（`/content` 配下、frontmatter 付き）+ gray-matter + next-mdx-remote/rsc |
| frontmatter 検証 | zod |
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
> Cloudflare Pages 上ではドメインルートから配信されるため問題ありません。

## 環境変数

`.env.example` をコピーして `.env.local` を作成します。

| 変数 | 説明 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 本番サイトの絶対URL（canonical / OGP / sitemap に使用）。末尾スラッシュなし |
| `NEXT_PUBLIC_GA_ID` | GA4 測定ID（例: `G-XXXXXXXXXX`）。**未設定なら GA は無効化** |

## ディレクトリ構成

```
app/        ルーティング（App Router）。sitemap.ts / robots.ts を含む
components/  UI コンポーネント（AffiliateLink, PrBadge, Analytics 等）
content/     MDX コンテンツ（blog）
lib/         コンテンツローダ・MDXレンダラ・SEOヘルパ・サイト設定
functions/   Cloudflare Pages Functions のプレースホルダ（将来追加用）
public/      静的アセット（OGP画像など）
```

## コンテンツの追加

`content/<type>/*.mdx` を追加するだけでページが生成されます（ファイル名 = slug）。
frontmatter は [`lib/schema.ts`](lib/schema.ts) の zod スキーマで検証され、
不正な場合はビルドが失敗します。

### 記事の frontmatter（blog）

```yaml
---
title: 'タイトル'
description: '説明（meta description / OGP に使用）'
date: '2026-05-20'
updated: '2026-05-30'      # 任意
tags: ['Next.js', 'TypeScript']
ogImage: '/og/foo.png'     # 任意。未指定はサイト共通デフォルト
hasAffiliate: true         # アフィリリンクを含む記事は true → 冒頭に「PR」表記を自動表示
---
```

MDX 本文では `<AffiliateLink href="...">` が利用できます
（`rel="sponsored nofollow"` / `target="_blank"` / `referrerPolicy` を自動付与）。

## アフィリエイト / ステマ規制対応

- `hasAffiliate: true` の記事は本文冒頭に「PR」バッジを**自動表示**します。
- サイト共通のアフィリエイト利用開示を **フッター** と **[/about](app/about/page.tsx)** に常時記載しています。
- 開示文は [`lib/site.ts`](lib/site.ts) の `affiliateDisclosure` で一元管理しています。

## SEO

- 各ページで `generateMetadata`（title / description / canonical / OGP / Twitter card）。
- JSON-LD: 記事 → `Article` + `BreadcrumbList`。
- `app/sitemap.ts` / `app/robots.ts` を静的生成。

## Cloudflare Pages へのデプロイ

GitHub リポジトリを Cloudflare Pages に接続し、以下を設定します。

| 設定項目 | 値 |
|---|---|
| Framework preset | `Next.js (Static HTML Export)` |
| Build command | `pnpm build` |
| Build output directory | **`out`** |
| 環境変数 | `NEXT_PUBLIC_SITE_URL`（必須）, `NEXT_PUBLIC_GA_ID`（任意） |

> pnpm を使うため、Cloudflare 側で `pnpm` が利用可能であることを確認してください
> （`package.json` の `packageManager` フィールドで自動検出されます）。

## TODO（将来対応）

静的書き出しの制約により、以下は Cloudflare Pages Functions 等で別途対応予定です。

- **動的OGP画像生成** — 現状は frontmatter 指定の静的画像 / サイト共通デフォルト。
  `public/og-default.png`（1200×630）を用意してください。
- **`/go/[id]` クリック計測リダイレクト** — [`functions/README.md`](functions/README.md) に雛形あり。
- **外部リンククリックの GA イベント送信** — `components/AffiliateLink.tsx` / `components/Analytics.tsx` の TODO コメント参照。
