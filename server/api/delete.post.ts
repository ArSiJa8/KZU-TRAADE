import { readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import jwt from 'jsonwebtoken'

type TokenPayload = {
    login: string
    role: 'admin' | 'user'
}

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

async function writePosts(posts: TradePost[]) {
    await writeFile(postsFile, JSON.stringify(posts, null, 2))
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const tokenSecret = config.tokenSecret

    if (!tokenSecret) {
        return {
            error: 'Server ist nicht richtig konfiguriert'
        }
    }

    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
        return {
            error: 'Bitte zuerst einloggen'
        }
    }

    let payload: TokenPayload

    try {
        payload = jwt.verify(token, tokenSecret) as TokenPayload
    } catch {
        return {
            error: 'Token ungültig'
        }
    }

    const body = await readBody<{ id?: string }>(event)

    if (!body?.id) {
        return {
            error: 'Kein Post angegeben'
        }
    }

    const posts = await readPosts()
    const post = posts.find((item) => item.id === body.id)

    if (!post) {
        return {
            error: 'Post nicht gefunden'
        }
    }

    if (payload.role !== 'admin' && post.ownerEmail !== payload.login) {
        return {
            error: 'Du darfst nur deine eigenen Posts löschen'
        }
    }

    const remainingPosts = posts.filter((item) => item.id !== body.id)

    for (const image of post.images) {
        const imageName = path.basename(image)
        const imagePath = path.join(process.cwd(), 'public', 'uploads', imageName)

        try {
            await unlink(imagePath)
        } catch {
            // Bild wurde eventuell bereits gelöscht.
        }
    }

    await writePosts(remainingPosts)

    return {
        success: true
    }
})