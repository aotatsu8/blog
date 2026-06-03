import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import type { ComponentType } from 'react'
import { AffiliateLink } from '@/components/AffiliateLink'
import { ProductCard } from '@/components/ProductCard'
import { PrBadge } from '@/components/PrBadge'

/**
 * RSC 内で MDX 本文をコンパイルして React 要素を返す。
 * ビルド時（静的書き出し）に評価されるため、サーバー専用機能を持ち込まない限り
 * output: 'export' と両立する。
 */

const prettyCodeOptions: PrettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: true,
}

/** MDX 本文から参照できるカスタムコンポーネント */
const mdxComponents: Record<string, ComponentType<any>> = {
  AffiliateLink,
  ProductCard,
  PrBadge,
}

export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
      },
    },
  })
  return content
}
