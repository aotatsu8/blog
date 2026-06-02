# Cloudflare Pages Functions（将来追加予定）

このディレクトリは、静的書き出しでは実現できないサーバー処理を
[Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/) で
追加するためのプレースホルダです。現時点では関数は未実装です。

## TODO: アフィリエイトクリック計測リダイレクト `/go/[id]`

クリック計測用の `/go/[id]` リダイレクトは `output: 'export'`（静的書き出し）では
作れないため、デプロイ後に Pages Functions として実装する。

雛形（`functions/go/[id].ts`）:

```ts
// マッピング（id -> アフィリエイト先 URL）は KV や定数で管理する想定
const LINKS: Record<string, string> = {
  // 'sample': 'https://www.amazon.co.jp/dp/XXXX?tag=your-22',
}

export const onRequest: PagesFunction = async (context) => {
  const id = (context.params.id as string) ?? ''
  const target = LINKS[id]
  if (!target) return new Response('Not found', { status: 404 })

  // TODO: ここでクリック計測（GA4 Measurement Protocol / Analytics Engine 等）を送信する
  return Response.redirect(target, 302)
}
```

実装後は、本文中の `<AffiliateLink href="/go/sample">` のように
内部の計測リダイレクトを経由させる運用に切り替える。
