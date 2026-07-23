# ブログ更新 → X 自動投稿（下書き生成）セットアップ手順

新しい手書き記事を `main` に push すると、GitHub Actions が投稿文を自動生成し、
**X 投稿用の下書き Issue** を作成します（推奨の「方式B」）。人間が写真を添えて手動投稿する運用です。

- ワークフロー: [.github/workflows/post-to-x.yml](../.github/workflows/post-to-x.yml)
- スクリプト: [scripts/post-to-x.mjs](../scripts/post-to-x.mjs)
- 投稿アカウント: **@Hachi8blog8**

## 投稿対象の絞り込み（自動）

- `content/blog/*.mdx` の**新規追加**ファイルのみ（push 差分の追加分を git diff で検出）
- `qiita-*.mdx` は**除外**（IT記事・重複コンテンツ）
- frontmatter `draft: true` は**除外**
- `title` が無いものは除外

## 生成される投稿文の例

```
【新着記事】ストウブ ピコ・ココット ラウンド 20cm レビュー

ミシュラン星付きフレンチで料理人をしていた僕が、ストウブ ピコ・ココット ラウンド 20cm を家…

https://blog.aotatsu7.workers.dev/blog/staub-cocotte-round-20cm/

#グルメ #調理器具
```

- タイトルは `｜` 以降のキャッチを落として主題だけ使用。280文字（Xの重み付き）を超える場合は自動で丸めます。
- フック文は `description` の冒頭1文。ハッシュタグはカテゴリ＋tags先頭の最大2個。

---

## 方式B（既定・推奨）：下書き Issue の生成 — **APIキー不要**

こちらは追加設定なしで動きます。`GITHUB_TOKEN`（Actions が自動付与）だけで Issue を作成します。

1. これらのファイルをコミットして `main` に push するだけ。
2. 手書き記事を新規追加して push すると、リポジトリの **Issues** に
   「X投稿下書き: <記事タイトル>」という Issue が立ちます。
3. Issue 本文の投稿文をコピーし、**写真を1〜2枚添えて** @Hachi8blog8 から手動投稿 → Issue を Close。

> 動作確認: Actions タブ → 「Post new article to X」→ 手書き記事を含む push で実行される。
> 記事が無い push では「投稿対象なし」で正常終了します。

---

## 方式A（任意）：X へ即時自動投稿する場合

写真なしの機械投稿になるため伸びにくいですが、完全自動にしたい場合の手順です。
X API のキー4つを GitHub Secrets に登録し、ワークフローの `POST_MODE` を `live` に変えます。

### 1. X Developer でアプリを作成しキーを取得

1. <https://developer.x.com/> にログイン（@Hachi8blog8 で）。無料プラン（Free）でOK。
   - 無料枠は**書き込み月500件**まで。ブログ更新通知には十分。
2. Project & App を作成。
3. アプリの **User authentication settings** を開き、
   - **App permissions: Read and write** に設定（重要。Read only だと投稿できない）
   - Type of App: **Web App / Automated App or Bot**（OAuth 1.0a を有効化）
   - Callback URL / Website URL は仮でよい（例: `https://blog.aotatsu7.workers.dev`）
4. **Keys and tokens** タブで以下4つを取得（`Read and write` 設定後に発行/再発行したものを使う）:
   - **API Key**（= Consumer Key）
   - **API Key Secret**（= Consumer Secret）
   - **Access Token**
   - **Access Token Secret**

> 注意: 権限を Read only のままトークンを発行すると投稿が 403 になります。
> 「Read and write」に変更 → **Access Token を再生成**してから登録してください。

### 2. GitHub Secrets に登録

リポジトリの **Settings → Secrets and variables → Actions → New repository secret** で、
以下の名前で4つ登録します（値はコードに書かない）。

| Secret 名 | 中身 |
|---|---|
| `X_API_KEY` | API Key |
| `X_API_SECRET` | API Key Secret |
| `X_ACCESS_TOKEN` | Access Token |
| `X_ACCESS_TOKEN_SECRET` | Access Token Secret |

### 3. ワークフローを live モードに切り替え

[.github/workflows/post-to-x.yml](../.github/workflows/post-to-x.yml) の env を変更:

```yaml
        env:
          POST_MODE: live   # ← draft から live に変更
```

これで push 時に @Hachi8blog8 へ自動投稿されます（下書き Issue は作られません）。

---

## ローカルでの動作確認

APIキーなしで投稿文プレビューだけ確認できます（Issue 起票・投稿はしません）。

```bash
# 特定記事の投稿文を確認
node scripts/post-to-x.mjs content/blog/staub-cocotte-round-20cm.mdx

# 実際に X へ投げてテストしたい場合（キーを環境変数で渡す）
POST_MODE=live \
X_API_KEY=xxx X_API_SECRET=xxx X_ACCESS_TOKEN=xxx X_ACCESS_TOKEN_SECRET=xxx \
node scripts/post-to-x.mjs content/blog/staub-cocotte-round-20cm.mdx
```

## 仕組みの補足

- トリガー: `main` への push かつ `content/blog/**` に変更があったとき。
- 追加ファイル判定: `git diff --diff-filter=A <before> <after>`（**新規追加のみ**。既存記事の編集では投稿しない）。
- 依存ゼロ: スクリプトは Node 標準APIのみ。frontmatter は簡易パーサ、OAuth 1.0a 署名は `node:crypto` で自前実装。CI での `pnpm install` は不要。
