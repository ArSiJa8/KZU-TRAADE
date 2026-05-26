import { BaseRepository } from './base.repository';
import type { Stats } from './types';

export class StatsRepository extends BaseRepository<Stats> {
    constructor() {
        super('stats.json');
    }

    async getStats(): Promise<Stats> {
        const stats = await this.readObject();
        return {
            totalViews: stats.totalViews || 0
        };
    }

    async incrementViews(): Promise<number> {
        const stats = await this.getStats();
        stats.totalViews++;
        await this.writeObject(stats);
        return stats.totalViews;
    }
}

export const statsRepository = new StatsRepository();
