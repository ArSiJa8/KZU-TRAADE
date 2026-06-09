import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import jwt from 'jsonwebtoken'

type TokenPayload = {
    login: string
    role: 'admin' | 'user'
}

type Message = {
    id: string
    postId: string
    author: string
    authorEmail: string
    content: string
    createdAt: string
}

type MessagesResult = {
    success?: boolean
    error?: string
    message?: Message
}

const messagesFile = path.join(process.cwd(), 'server', 'data', 'messages.json')
const blocklistFile = path.join(process.cwd(), 'server', 'data', 'blocklist.json')

async function readMessages(): Promise<Message[]> {
    try {
        const content = await readFile(messagesFile, 'utf-8')
        return JSON.parse(content) as Message[]
    } catch {
        return []
    }
}

async function readBlocklist(): Promise<string[]> {
    try {
        const content = await readFile(blocklistFile, 'utf-8')
        return JSON.parse(content) as string[]
    } catch {
        return []
    }
}

async function writeMessages(messages: Message[]) {
    await mkdir(path.dirname(messagesFile), { recursive: true })
    await writeFile(messagesFile, JSON.stringify(messages, null, 2))
}

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

export default defineEventHandler(async (event): Promise<MessagesResult> => {
    const config = useRuntimeConfig(event)
    const tokenSecret = config.tokenSecret

    if (!tokenSecret) {
        return {
            error: 'Server nicht korrekt konfiguriert'
        }
    }

    // Token aus Header holen
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            error: 'Authentifizierung erforderlich'
        }
    }

    const token = authHeader.slice(7)

    // Token verifizieren
    let payload: TokenPayload
    try {
        payload = jwt.verify(token, tokenSecret) as TokenPayload
    } catch {
        return {
            error: 'Ungültiger oder abgelaufener Token'
        }
    }

    // Request Body parsen
    const body = await readBody(event)
    const { postId, content } = body

    if (!postId || !content) {
        return {
            error: 'Post ID und Nachrichtentext erforderlich'
        }
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
        return {
            error: 'Nachricht darf nicht leer sein'
        }
    }

    if (content.length > 2000) {
        return {
            error: 'Nachricht darf maximal 2000 Zeichen lang sein'
        }
    }

    let finalContent = content.trim()
    const blocklist = await readBlocklist()
    const lowerContent = finalContent.toLowerCase()

    const foundBlocked = blocklist.some(word => lowerContent.includes(word.toLowerCase()))
    if (foundBlocked) {
        finalContent = '[GEBLOCKTER INHALT]'
    }

    // Neue Nachricht erstellen
    const message: Message = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        postId,
        author: getUserNameFromEmail(payload.login),
        authorEmail: payload.login,
        content: finalContent,
        createdAt: new Date().toISOString()
    }

    // Nachrichten speichern
    const messages = await readMessages()
    messages.push(message)
    await writeMessages(messages)

    return {
        success: true,
        message
    }
})
