import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { existsSync } from 'node:fs'

export default defineEventHandler(async (event) => {
    const filename = event.context.params?.file
    if (!filename) {
        throw createError({ statusCode: 400, statusMessage: 'Dateiname fehlt' })
    }

    const isProd = process.env.NODE_ENV === 'production'
    let uploadDir = path.resolve('public/uploads')
    
    if (isProd) {
        // In prod, check both .output and project root
        const prodPath = path.resolve('.output/public/uploads')
        if (existsSync(prodPath)) {
            uploadDir = prodPath
        }
    }

    const filePath = path.join(uploadDir, filename)

    try {
        if (!existsSync(filePath)) {
            throw createError({ statusCode: 404, statusMessage: 'Bild nicht gefunden' })
        }

        const data = await readFile(filePath)
        
        // Simple mime type detection
        const ext = filename.split('.').pop()?.toLowerCase()
        const mimeTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif'
        }

        if (ext && mimeTypes[ext]) {
            setResponseHeader(event, 'Content-Type', mimeTypes[ext])
        }

        return data
    } catch (e: any) {
        throw createError({ 
            statusCode: e.statusCode || 500, 
            statusMessage: e.statusMessage || 'Fehler beim Laden des Bildes' 
        })
    }
})
