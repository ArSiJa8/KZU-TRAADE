import { unlink } from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ file?: string }>(event)

    if (!body?.file) {
        return {
            error: 'Keine Datei angegeben'
        }
    }

    const file = path.basename(body.file)
    const filePath = path.join(process.cwd(), 'public', 'uploads', file)

    try {
        await unlink(filePath)

        return {
            success: true
        }
    } catch {
        return {
            error: 'Datei nicht gefunden'
        }
    }
})