/**
 * 構造化データ (JSON-LD) を <script> として埋め込むサーバーコンポーネント。
 * 任意の JSON-LD オブジェクトを受け取り、そのまま出力する。
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD は信頼できる自前データのみを埋め込む
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
