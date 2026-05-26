import { createHash, randomUUID } from 'node:crypto'
import type { User } from '../utils/repositories/types'

function hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex')
}

function generateVerificationToken() {
    return randomUUID()
}

function isAllowedKzuEmail(email: string) {
    return /^[^\s@]+@([a-z0-9-]+\.)*kzu\.ch$/i.test(email)
}

async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/verify-email?token=${token}`
    
    console.log(`Verification email would be sent to ${email}`)
    console.log(`Verification URL: ${verificationUrl}`)
    
    return true
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        email?: string
        password?: string
    }>(event)

    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
        throw createError({ statusCode: 400, statusMessage: 'E-Mail und Passwort angeben' })
    }

    if (!isAllowedKzuEmail(email)) {
        throw createError({ statusCode: 400, statusMessage: 'Nur E-Mail-Adressen mit kzu.ch sind erlaubt' })
    }

    if (password.length < 4) {
        throw createError({ statusCode: 400, statusMessage: 'Passwort muss mindestens 4 Zeichen haben' })
    }

    const existingUser = await userRepository.getByEmail(email)

    if (existingUser) {
        throw createError({ statusCode: 400, statusMessage: 'Diese E-Mail ist bereits registriert' })
    }

    const verificationToken = generateVerificationToken()
    const verificationTokenExpiry = Date.now() + (24 * 60 * 60 * 1000)

    const newUser: User = {
        id: randomUUID(),
        email,
        passwordHash: hashPassword(password),
        role: 'user',
        verified: false,
        verificationToken,
        verificationTokenExpiry
    }

    await userRepository.create(newUser)
    await sendVerificationEmail(email, verificationToken)

    return {
        success: true,
        message: 'Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse.'
    }
})
