import type { Post } from '@/lib/posts'

export function contarTags(posts: Post[]): { tag: string; total: number }[] {
  const totais = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) totais.set(tag, (totais.get(tag) ?? 0) + 1)
  }

  return [...totais.entries()]
    .map(([tag, total]) => ({ tag, total }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag))
}
