import { getOnlineUsers, setRedirect } from '../utils/online-tracker'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import jwt from 'jsonwebtoken'

const statsFile = path.join(process.cwd(), 'server', 'data', 'stats.json')

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const tokenSecret = config.tokenSecret
    
    // Protect this endpoint - only admin
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!token || !tokenSecret) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token, tokenSecret) as { role: string }
        if (decoded.role !== 'admin') {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
        }
    } catch {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const method = getMethod(event)

    if (method === 'GET') {
        let totalViews = 0
        try {
            const content = await readFile(statsFile, 'utf-8')
            const stats = JSON.parse(content)
            totalViews = stats.totalViews
        } catch { /* ignore */ }

        const onlineUsers = getOnlineUsers()
        
        // Enrich user info if they are logged in
        // (The online-tracker already stores 'login' which is email/admin)
        
        return {
            totalViews,
            onlineCount: onlineUsers.length,
            users: onlineUsers
        }
    }

    if (method === 'POST') {
        const body = await readBody<{ url: string, targetId?: string }>(event)
        if (body.url) {
            setRedirect(body.url, body.targetId)
            return { success: true }
        }
    }

    return { error: 'Invalid method' }
})