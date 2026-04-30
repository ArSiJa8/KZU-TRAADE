import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async () => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

    await mkdir(uploadDir, { recursive: true })

    const files = await readdir(uploadDir)

    const images = files
        .filter((file) => allowedExtensions.includes(path.extname(file).toLowerCase()))
        .sort()
        .reverse()

    return {
        success: true,
        images
    }
})