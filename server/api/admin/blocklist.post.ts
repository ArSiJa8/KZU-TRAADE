import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const blocklistFile = path.join(process.cwd(), 'server', 'data', 'blocklist.json')

export default defineEventHandler(async (event) => {
    // Auth is checked by middleware
    const body = await readBody<{ words: string[] }>(event)
    
    if (!Array.isArray(body.words)) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültiges Format' })
    }

    await mkdir(path.dirname(blocklistFile), { recursive: true })
    await writeFile(blocklistFile, JSON.stringify(body.words, null, 2))

    return {
        success: true
    }
})
