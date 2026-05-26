import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export abstract class BaseRepository<T> {
    protected dataDir = path.join(process.cwd(), 'server', 'data');
    protected filePath: string;

    constructor(fileName: string) {
        this.filePath = path.join(this.dataDir, fileName);
    }

    protected async read(): Promise<T[]> {
        try {
            const content = await readFile(this.filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return [];
        }
    }

    protected async write(data: T[]): Promise<void> {
        await mkdir(this.dataDir, { recursive: true });
        await writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

    protected async readObject(): Promise<T> {
        try {
            const content = await readFile(this.filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return {} as T;
        }
    }

    protected async writeObject(data: T): Promise<void> {
        await mkdir(this.dataDir, { recursive: true });
        await writeFile(this.filePath, JSON.stringify(data, null, 2));
    }
}
