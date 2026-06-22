import { admin } from './supabase/admin'

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
    const { data } = await admin.from('stores').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
    slug = `${base}-${++attempt}`
  }
}
