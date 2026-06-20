import { prisma } from './prisma'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let attempt = 1

  while (true) {
    const existing = await prisma.store.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${base}-${++attempt}`
  }
}
