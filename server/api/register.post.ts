import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'

type User = {
    id: string
    email: string
    passwordHash: string
    role: 'user'
}

const dataDir = path.join(process.cwd(), 'server', 'data')
const usersFile = path.join(dataDir, 'users.json')

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

async function writeUsers(users: User[]) {
    await mkdir(dataDir, { recursive: true })
    await writeFile(usersFile, JSON.stringify(users, null, 2))
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        email?: string
        password?: string
    }>(event)

    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
        return {
            error: 'E-Mail und Passwort angeben'
        }
    }

    if (!isAllowedKzuEmail(email)) {
        return {
            error: 'Nur E-Mail-Adressen mit kzu.ch sind erlaubt'
        }
    }

    if (password.length < 4) {
        return {
            error: 'Passwort muss mindestens 4 Zeichen haben'
        }
    }

    const users = await readUsers()

    if (users.some((user) => user.email === email)) {
        return {
            error: 'Diese E-Mail ist bereits registriert'
        }
    }

    users.push({
        id: randomUUID(),
        email,
        passwordHash: hashPassword(password),
        role: 'user'
    })

    await writeUsers(users)

    return {
        success: true
    }
})