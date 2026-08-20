import type { Post } from '@/lib/posts'

/** Pilar em comum vale mais que tag em comum; empate resolve pela data. */
function afinidade(a: Post, b: Post): number {
  const mesmoPilar = a.pilar === b.pilar ? 10 : 0
  const tagsEmComum = b.tags.filter((tag) => a.tags.includes(tag)).length
  return mesmoPilar + tagsEmComum
}

export function relacionados(posts: Post[], atual: Post, limite = 2): Post[] {
  return posts
    .filter((post) => post.slug !== atual.slug && post.locale === atual.locale)
    .map((post) => ({ post, peso: afinidade(atual, post) }))
    .sort((a, b) => b.peso - a.peso || b.post.data.localeCompare(a.post.data))
    .slice(0, limite)
    .map(({ post }) => post)
}
