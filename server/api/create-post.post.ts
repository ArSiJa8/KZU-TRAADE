import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

type Post = {
  id: string
  title: string
  description: string
  category: 'feature' | 'bug' | 'design' | 'other'
  wishes?: string // Neues Feld für Wünsche
  author: string
  createdAt: number
  updatedAt: number
}

const dataDir = path.join(process.cwd(), 'server', 'data')
const postsFile = path.join(dataDir, 'posts.json')

async function readPosts(): Promise<Post[]> {
  try {
    const content = await readFile(postsFile, 'utf-8')
    return JSON.parse(content) as Post[]
  } catch {
    return []
  }
}

async function writePosts(posts: Post[]) {
  await mkdir(dataDir, { recursive: true })
  await writeFile(postsFile, JSON.stringify(posts, null, 2))
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth')
  const authHeader = getHeader(event, 'authorization')

  if (!token && !authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentifizierung erforderlich'
    })
  }

  const body = await readBody<{
    title?: string
    description?: string
    category?: string
    wishes?: string // Neues Feld
  }>(event)

  const { title, description, category, wishes } = body

  if (!title || !description || !category) {
    return {
      error: 'Titel, Beschreibung und Kategorie sind erforderlich'
    }
  }

  if (!['feature', 'bug', 'design', 'other'].includes(category)) {
    return {
      error: 'Ungültige Kategorie'
    }
  }

  try {
    const posts = await readPosts()
    const now = Date.now()

    const newPost: Post = {
      id: randomUUID(),
      title,
      description,
      category: category as any,
      wishes: wishes || undefined, // Speichere Wünsche (falls vorhanden)
      author: authHeader ? 'User' : 'Admin',
      createdAt: now,
      updatedAt: now
    }

    posts.push(newPost)
    await writePosts(posts)

    return {
      success: true,
      post: newPost,
      message: 'Post erfolgreich erstellt!'
    }
  } catch (error: any) {
    return {
      error: 'Fehler beim Erstellen des Posts: ' + error.message
    }
  }
})
