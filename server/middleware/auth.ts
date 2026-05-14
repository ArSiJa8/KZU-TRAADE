import jwt from 'jsonwebtoken'

type TokenPayload = {
    login: string
    role: 'admin' | 'user'
}

export default defineEventHandler((event) => {
    const config = useRuntimeConfig(event)
    const tokenSecret = config.tokenSecret

    const { pathname } = getRequestURL(event)
    const protectedRoutes = ['/api/upload', '/api/delete']

    if (!protectedRoutes.includes(pathname)) {
        return
    }

    if (!tokenSecret) {
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
        jwt.verify(token, tokenSecret) as TokenPayload
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