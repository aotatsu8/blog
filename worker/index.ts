/**
 * Cloudflare Worker のエントリ。
 * - `/go/:id` → 登録したアフィリエイトURLへ 302 リダイレクト（クリックの集約・差し替え・計測用）
 * - それ以外 → 静的アセット（out/）をそのまま配信（wrangler.jsonc の ASSETS バインディング）
 *
 * 使い方: 記事側は `<ProductCard rakuten="/go/mx-mechanical-mini" />` のように内部URLを指定でき、
 * 実リンクの差し替えは下の LINKS を直すだけで全記事に反映できる。
 */

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

/** id → 遷移先（アフィリエイトURL）。ここを編集すればリンクを一括管理できる。 */
const LINKS: Record<string, string> = {
  'mx-mechanical-mini':
    'https://af.moshimo.com/af/c/click?a_id=5613953&p_id=54&pc_id=54&pl_id=27059&url=https%3A%2F%2Fitem.rakuten.co.jp%2Flogicool%2Fkx850msg%2F',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const match = url.pathname.match(/^\/go\/([^/]+)\/?$/)

    if (match) {
      const id = decodeURIComponent(match[1])
      const target = LINKS[id]
      if (!target) return new Response('Not found', { status: 404 })

      // TODO(計測): クリックをサーバー側で記録する場合はここで送信する。
      //   - Cloudflare Analytics Engine（wrangler の analytics_engine_datasets バインディング）に writeDataPoint
      //   - もしくは GA4 Measurement Protocol へ fetch（api_secret が必要）
      return Response.redirect(target, 302)
    }

    // `/go` 以外は静的アセットを返す（無ければ 404-page）
    return env.ASSETS.fetch(request)
  },
}
