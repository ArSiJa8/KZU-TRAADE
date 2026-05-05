import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const form = await readMultipartFormData(event)

    if (!form || !form[0]) {
        return { error: 'Keine Datei erhalten' }
    }

    const file = form[0]

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type || '')) {
        return { error: 'Ungültiges Dateiformat' }
    }

    if (file.data.length > 10 * 1024 * 1024) {
        return { error: 'Datei zu groß (max. 10 MB)' }
    }

    const original = file.filename || 'bild'
    const ext = original.includes('.') ? original.split('.').pop() : 'jpg'
    const newName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const uploadPath = path.join(uploadDir, newName)

    await mkdir(uploadDir, { recursive: true })

    await writeFile(uploadPath, file.data)

    return { success: true, file: newName }
})