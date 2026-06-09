import { readFile } from 'node:fs/promises'
import path from 'node:path'

const blocklistFile = path.join(process.cwd(), 'server', 'data', 'blocklist.json')

export async function readBlocklist(): Promise<string[]> {
    try {
        const content = await readFile(blocklistFile, 'utf-8')
        return JSON.parse(content) as string[]
    } catch {
        return []
    }
}

export default defineEventHandler(async () => {
    const words = await readBlocklist()
    return {
        success: true,
        words
    }
})
