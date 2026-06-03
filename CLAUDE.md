# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # 開発サーバー (http://localhost:3000)
pnpm build          # 静的書き出し → out/（成功条件はこれが通ること）
pnpm preview        # out/ をローカルHTTP配信して確認（pnpm dlx serve out）
pnpm lint           # next lint
pnpm typecheck      # tsc --noEmit
pnpm import:qiita [user]   # Qiita投稿を content/blog/qiita-*.mdx として取り込み（既定user=aotatsu8）
```

テストフレームワークは無い。変更の検証は `pnpm build` の成否＋必要に応じて `pnpm preview` で行う。

## 最重要の制約：完全静的書き出し（`output: 'export'`）

`next.config.mjs` で `output: 'export'` / `images.unoptimized` / `trailingSlash: true`。
**サーバー実行時の機能は一切使えない**: Route Handler の動的処理・ISR・middleware・サーバー側 runtime。
- データ取得は**ビルド時のみ**（`lib/content.ts` が Node の `fs` を使うので Server Component / `generateStaticParams` からのみ呼ぶ）。
- 動的なものはクライアント側で処理する（例: ブログのカテゴリ絞り込みは `components/BlogList.tsx` のクライアント側フィルタ）。
- `out/index.html` を `file://` で直接開くと `/_next/...` 絶対パスが解決できず**スタイルが崩れる**。確認は必ず HTTP 配信（`pnpm preview`）で。

## コンテンツのパイプライン（複数ファイルにまたがる中核）

記事 = `content/blog/*.mdx`（ファイル名 = slug）。フローは:

1. `lib/schema.ts` — zod で frontmatter を検証（不正ならビルド失敗）。`BLOG_CATEGORIES`（`IT/日常/旅/グルメ/work`）を定義。
2. `lib/content.ts` — `fs` で列挙 → `gray-matter` で frontmatter 抽出 → zod 検証 → date 降順。`getAllContent('blog')` / `getContentBySlug` / `getContentSlugs`（`generateStaticParams` 用）。
3. `lib/mdx.tsx` — `compileMDX`（next-mdx-remote/rsc）で RSC 内コンパイル。remark-gfm / rehype-slug / rehype-pretty-code(shiki)。**MDX から使えるコンポーネントはここの components マップで登録**（`AffiliateLink` / `ProductCard` / `PrBadge`）。
4. `app/blog/[slug]/page.tsx` 等が描画。`lib/seo.ts` で `generateMetadata` と JSON-LD（Article + BreadcrumbList）。

### frontmatter の必須・要点
- `category` は**必須**で5カテゴリのいずれか1つ（未指定・5種以外は**ビルドエラー**）。一覧の絞り込みは `category` のみで行い、`tags` は記事内の表示専用。
- `hasAffiliate: true` の記事は本文冒頭に PR バッジ（`components/PrBadge.tsx`）が**自動表示**される。さらに、本文に `<AffiliateLink>` / `<ProductCard>` があれば `lib/content.ts` が `hasAffiliate` を**強制的に true**にする（PR表記の付け忘れ防止）。
- `sourceUrl` / `sourceName` を入れると「（Qiita 等）にも掲載」リンクを表示。

## 設定の一元管理：`lib/site.ts`

サイト名・本番URL・GA4測定ID・SNS・お問い合わせ(Googleフォーム)URL・各種開示文をここに集約。
**環境変数があれば優先、無ければコードの既定値**（`NEXT_PUBLIC_SITE_URL` 既定 = 本番URL、`NEXT_PUBLIC_GA_ID` 既定 = 設定済みID）。
`navItems` / `legalNavItems`（フッター）/ `absoluteUrl()` もここ。Amazon必須表記は `amazonAssociateDisclosure`。

## アフィリエイト / 計測

- `AffiliateLink` と `ProductCard` は**クライアントコンポーネント**で、クリック時に GA4 カスタムイベント `affiliate_click` を送信（`lib/gtag.ts` の `trackAffiliateClick`）。外部リンクには `rel="sponsored nofollow noopener"` / `target="_blank"` / `referrerPolicy` を自動付与。
- **もしものHTML（かんたんリンク）を MDX に直接貼らない**（`style="..."` 文字列属性が JSX で壊れる）。代わりに `ProductCard` に URL を渡す。もしも経由の楽天リンクは `https://af.moshimo.com/af/c/click?...&url=<商品URLエンコード>` の形（`&url=` を付けないと楽天トップに着地する）。
- GA4 は `siteConfig.gaId` が空なら無効（`components/Analytics.tsx`）。

## Qiita 取り込み（`scripts/import-qiita.mjs`）

Qiita API v2 から記事を取得し `content/blog/qiita-<記事ID>.mdx` を生成。**再実行で上書き同期**（Qiita 側削除も追従）。`category: 'IT'` を自動付与。コード外の `{ } <タグ` を自動エスケープし、本文先頭の重複タイトル見出しを除去。
- **`qiita-*.mdx` を手編集しても再同期で上書きされる**。恒久編集したい記事は `qiita-` プレフィックスを外して別 slug にする。
- `.github/workflows/sync-qiita.yml` が毎日 09:00 JST に自動実行 → 差分を commit/push → Cloudflare が再デプロイ。

## デプロイ（Cloudflare Worker の静的アセット配信）

Pages ではなく **Worker** として配信している。GitHub push で自動ビルド（Build: `pnpm build` / Deploy: `npx wrangler deploy`）。
- **`wrangler.jsonc` は必須**。`main: worker/index.ts` ＋ `assets.directory: ./out`（binding `ASSETS`）。これが無いと `wrangler deploy` が Next.js を検知して **OpenNext(SSR) へ自動移行**し、`output: 'export'` と噛み合わずビルドが失敗する。
- `worker/index.ts` が `/go/:id` を `LINKS` のアフィリエイトURLへ 302 リダイレクト（リンク一括管理用）、それ以外は `env.ASSETS` で静的配信。
- 本番URL: https://blog.aotatsu7.workers.dev

## 作業上の慣習

- **`git push` を自動で実行しない**。ユーザー自身が push する。明示依頼が無い限り commit も控え、変更はファイル編集に留める。
