import { deleteFromS3 } from '../utils/s3'

function getObjectKeyFromUrl(url: string): string {
    // URL format: http://minio-host:9000/bucket/objectKey
    // We need just the objectKey (everything after the bucket name)
    try {
        const parsed = new URL(url)
        // pathname is /bucket/objectKey → remove leading /bucket/
        const parts = parsed.pathname.split('/').filter(Boolean)
        // parts[0] = bucket, parts[1..] = key segments
        return parts.slice(1).join('/')
    } catch {
        // Fallback: treat as plain filename
        return url
    }
}

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

    // Delete images from MinIO
    if (post.images) {
        for (const imageUrl of post.images) {
            const objectKey = getObjectKeyFromUrl(imageUrl)
            await deleteFromS3(objectKey)
        }
    }

    await postRepository.delete(body.id)

    return {
        success: true,
    }
})
