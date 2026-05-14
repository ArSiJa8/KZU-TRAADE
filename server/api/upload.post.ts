import { mkdir, readFile, writeFile } from 'node:fs/promises'
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

function getUserNameFromEmail(email: string) {
    if (email === 'admin') {
        return 'Admin'
    }

    const namePart = email.split('@')[0] ?? email

    return namePart
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
}

async function readPosts(): Promise<TradePost[]> {
    try {
        const content = await readFile(postsFile, 'utf-8')
        return JSON.parse(content) as TradePost[]
    } catch {
        return []
    }
}

async function writePosts(posts: TradePost[]) {
    await mkdir(path.dirname(postsFile), { recursive: true })
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

    const form = await readMultipartFormData(event)

    if (!form?.length) {
        return {
            error: 'Keine Daten erhalten'
        }
    }

    const title = form.find((item) => item.name === 'title')?.data.toString().trim()
    const description = form.find((item) => item.name === 'description')?.data.toString().trim()
    const category = form.find((item) => item.name === 'category')?.data.toString().trim() as TradeCategory | undefined
    const mainImageIndexRaw = form.find((item) => item.name === 'mainImageIndex')?.data.toString()
    const rulesAccepted = form.find((item) => item.name === 'rulesAccepted')?.data.toString() === 'true'

    const allowedCategories: TradeCategory[] = ['Schulmaterial', 'Stifte', 'Anderes']

    if (!title) {
        return {
            error: 'Bitte einen Titel eingeben'
        }
    }

    if (!description) {
        return {
            error: 'Bitte eine Beschreibung eingeben'
        }
    }

    if (!category || !allowedCategories.includes(category)) {
        return {
            error: 'Bitte eine gültige Kategorie auswählen'
        }
    }

    if (!rulesAccepted) {
        return {
            error: 'Bitte zuerst die Regeln akzeptieren'
        }
    }

    const files = form.filter((item) => item.name === 'files' && item.filename)

    if (!files.length) {
        return {
            error: 'Bitte mindestens ein Bild auswählen'
        }
    }

    if (files.length > 8) {
        return {
            error: 'Maximal 8 Bilder erlaubt'
        }
    }

    const mainImageIndex = Number(mainImageIndexRaw ?? 0)

    if (!Number.isInteger(mainImageIndex) || mainImageIndex < 0 || mainImageIndex >= files.length) {
        return {
            error: 'Ungültiges Hauptbild'
        }
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    await mkdir(uploadDir, { recursive: true })

    const savedImages: string[] = []

    for (const file of files) {
        if (!allowed.includes(file.type || '')) {
            return {
                error: 'Ungültiges Dateiformat'
            }
        }

        if (file.data.length > 10 * 1024 * 1024) {
            return {
                error: 'Eine Datei ist zu groß (max. 10 MB)'
            }
        }

        const original = file.filename || 'bild'
        const ext = original.includes('.') ? original.split('.').pop() : 'jpg'
        const newName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const uploadPath = path.join(uploadDir, newName)

        await writeFile(uploadPath, file.data)
        savedImages.push(newName)
    }

    const mainImage = savedImages[mainImageIndex]

    if (!mainImage) {
        return {
            error: 'Ungültiges Hauptbild'
        }
    }

	if (!savedImages.length) {
		return {
			error: 'Keine Bilder gespeichert'
		}
	}

    const post: TradePost = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title,
        description,
        category,
        images: savedImages,
        mainImage,
        ownerEmail: payload.login,
        ownerName: getUserNameFromEmail(payload.login),
        createdAt: new Date().toISOString()
    }

    const posts = await readPosts()
    posts.unshift(post)

    await writePosts(posts)

    return {
        success: true,
        post
    }
})