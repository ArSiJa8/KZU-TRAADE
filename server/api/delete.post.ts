import { unlink } from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    // Auth is already checked by middleware
    const payload = event.context.auth!

    const body = await readBody<{ id?: string }>(event)

    if (!body?.id) {
        throw createError({ statusCode: 400, statusMessage: 'Kein Post angegeben' })
    }

    const post = await postRepository.getById(body.id)

    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Post nicht gefunden' })
    }

    if (payload.role !== 'admin' && post.ownerEmail !== payload.login) {
        throw createError({ statusCode: 403, statusMessage: 'Du darfst nur deine eigenen Posts löschen' })
    }

    if (post.images) {
        for (const image of post.images) {
            const imageName = path.basename(image)
            const imagePath = path.join(process.cwd(), 'public', 'uploads', imageName)

            try {
                await unlink(imagePath)
            } catch {
                // Bild wurde eventuell bereits gelöscht.
            }
        }
    }

    await postRepository.delete(body.id)

    return {
        success: true
    }
})
