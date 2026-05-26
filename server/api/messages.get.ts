import { readFile } from 'node:fs/promises'
import path from 'node:path'

type Message = {
    id: string
    postId: string
    author: string
    authorEmail: string
    content: string
    createdAt: string
}

const messagesFile = path.join(process.cwd(), 'server', 'data', 'messages.json')

async function readMessages(): Promise<Message[]> {
    try {
        const content = await readFile(messagesFile, 'utf-8')
        return JSON.parse(content) as Message[]
    } catch {
        return []
    }
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const postId = query.postId as string

    if (!postId) {
        return {
            error: 'Post ID erforderlich',
            messages: []
        }
    }

    const messages = await readMessages()
    const postMessages = messages.filter(msg => msg.postId === postId)

    return {
        success: true,
        messages: postMessages
    }
})
