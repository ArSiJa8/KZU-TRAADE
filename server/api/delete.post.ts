// server/api/upload.post.ts
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const form = await readMultipartFormData(event)

    if (!form?.[0]) {
        return {
            error: 'Keine Datei erhalten'
        }
    }

    const file = form[0]

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (!allowedTypes.includes(file.type || '')) {
        return {
            error: 'Ungültiges Dateiformat'
        }
    }

    if (file.data.length > 5 * 1024 * 1024) {
        return {
            error: 'Datei zu groß (max. 5 MB)'
        }
    }

    const originalName = file.filename || 'bild.jpg'
    const extension = path.extname(originalName).toLowerCase() || '.jpg'
    const safeExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

    if (!safeExtensions.includes(extension)) {
        return {
            error: 'Ungültige Dateiendung'
        }
    }

    const newName = `${Date.now()}_${Math.random().toString(36).slice(2)}${extension}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const uploadPath = path.join(uploadDir, newName)

    await mkdir(uploadDir, {
        recursive: true
    })

    await writeFile(uploadPath, file.data)

    return {
        success: true,
        file: newName
    }
})