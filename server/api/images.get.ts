import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type TradeCategory = 'Schulmaterial' | 'Stifte' | 'Anderes'

type TradePost = {
    id: string
    title: string
    description: string
    category: TradeCategory
    images: string[]
    mainImage: string
    ownerEmail: string
    ownerName: string
    createdAt: string
}

const postsFile = path.join(process.cwd(), 'server', 'data', 'posts.json')

async function readPosts(): Promise<TradePost[]> {
    try {
        const content = await readFile(postsFile, 'utf-8')
        return JSON.parse(content) as TradePost[]
    } catch {
        return []
    }
}

export default defineEventHandler(async () => {
    await mkdir(path.dirname(postsFile), { recursive: true })

    const posts = await readPosts()

    await writeFile(postsFile, JSON.stringify(posts, null, 2))

    return {
        success: true,
        posts
    }
})