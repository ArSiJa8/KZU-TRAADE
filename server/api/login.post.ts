import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import jwt from 'jsonwebtoken'

type User = {
    id: string
    email: string
    passwordHash: string
    role: 'admin' | 'user'
}

const usersFile = path.join(process.cwd(), 'server', 'data', 'users.json')

function hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex')
}

function isAllowedKzuEmail(email: string) {
    return /^[^\s@]+@([a-z0-9-]+\.)*kzu\.ch$/i.test(email)
}

async function readUsers(): Promise<User[]> {
    try {
        const content = await readFile(usersFile, 'utf-8')
        return JSON.parse(content) as User[]
    } catch {
        return []
    }
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        login?: string
        password?: string
    }>(event)

    const login = body.login?.trim().toLowerCase()
    const password = body.password

    if (!login || !password) {
        return {
            error: 'Login und Passwort angeben'
        }
    }

    if (!process.env.TOKEN_SECRET) {
        return {
            error: 'Server ist nicht richtig konfiguriert'
        }
    }

    if (login === 'admin' && password === 'Passwort') {
        const token = jwt.sign(
            {
                login: 'admin',
                role: 'admin'
            },
            process.env.TOKEN_SECRET,
            {
                expiresIn: '12h'
            }
        )

        return {
            success: true,
            token,
            role: 'admin',
            login: 'admin'
        }
    }

    if (!isAllowedKzuEmail(login)) {
        return {
            error: 'Nur E-Mail-Adressen mit kzu.ch sind erlaubt'
        }
    }

    const users = await readUsers()
    const user = users.find((item) => item.email === login)

    if (!user || user.passwordHash !== hashPassword(password)) {
        return {
            error: 'Falsche Login-Daten'
        }
    }

    const token = jwt.sign(
        {
            login: user.email,
            role: user.role
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: '12h'
        }
    )

    return {
        success: true,
        token,
        role: user.role,
        login: user.email
    }
})