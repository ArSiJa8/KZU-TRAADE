import jwt from 'jsonwebtoken'

type TokenPayload = {
    login: string
    role: 'admin' | 'user'
}

export default defineEventHandler((event) => {
    const protectedRoutes = ['/api/upload', '/api/delete']

    if (!protectedRoutes.includes(event.path)) {
        return
    }

    if (!process.env.TOKEN_SECRET) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server ist nicht richtig konfiguriert'
        })
    }

    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Nicht eingeloggt'
        })
    }

    try {
        const payload = jwt.verify(token, process.env.TOKEN_SECRET) as TokenPayload

        if (event.path === '/api/delete' && payload.role !== 'admin') {
            throw createError({
                statusCode: 403,
                statusMessage: 'Nur Admins dürfen Bilder löschen'
            })
        }
    } catch (error) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 403,
            statusMessage: 'Token ungültig'
        })
    }
})