import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

let s3Client: S3Client | null = null

export function getS3Client(): S3Client {
    if (!s3Client) {
        const endpoint = process.env.MINIO_ENDPOINT
        const accessKeyId = process.env.MINIO_ACCESS_KEY
        const secretAccessKey = process.env.MINIO_SECRET_KEY

        if (!endpoint || !accessKeyId || !secretAccessKey) {
            throw new Error('MinIO environment variables (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY) are not set')
        }

        s3Client = new S3Client({
            endpoint,
            region: 'us-east-1', // MinIO accepts any region string
            credentials: { accessKeyId, secretAccessKey },
            forcePathStyle: true, // Required for MinIO
        })
    }
    return s3Client
}

export function getBucket(): string {
    return process.env.MINIO_BUCKET || 'uploads'
}

export function getMinioPublicUrl(objectKey: string): string {
    const publicUrl = process.env.MINIO_PUBLIC_URL || ''
    // Public URL format: https://pub-xxx.r2.dev/<filename> (no bucket in path)
    return `${publicUrl.replace(/\/$/, '')}/${objectKey}`
}

export async function uploadToS3(key: string, data: Buffer, contentType: string): Promise<string> {
    const client = getS3Client()
    const bucket = getBucket()

    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
    }))

    return getMinioPublicUrl(key)
}

export async function deleteFromS3(key: string): Promise<void> {
    const client = getS3Client()
    const bucket = getBucket()

    try {
        await client.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        }))
    } catch {
        // Ignore – object may already be deleted
    }
}
