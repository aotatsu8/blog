/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 無料枠へデプロイするため完全静的書き出し。
  // これにより Route Handler の動的処理 / ISR / middleware は使用不可になる。
  output: 'export',
  images: {
    // 静的書き出しでは Next.js の画像最適化サーバーが使えないため無効化。
    unoptimized: true,
  },
  // ディレクトリ単位の index.html を生成し、Cloudflare Pages での配信を安定させる。
  trailingSlash: true,
}

export default nextConfig
