import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const statsFile = path.join(process.cwd(), 'server', 'data', 'stats.json')

async function incrementViews() {
    let stats = { totalViews: 0 }
    try {
        const content = await readFile(statsFile, 'utf-8')
        stats = JSON.parse(content)
    } catch {
        // File doesn't exist yet
    }
    stats.totalViews++
    await writeFile(statsFile, JSON.stringify(stats, null, 2))
}

export default defineEventHandler(async (event) => {
    const { pathname } = getRequestURL(event)

    // Only track page views, not API or static assets
    if (!pathname.startsWith('/api') && !pathname.includes('.')) {
        await incrementViews()
    }
})