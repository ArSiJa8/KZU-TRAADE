import { BaseRepository } from './base.repository';
import type { User } from './types';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super('users.json');
    }

    async getAll(): Promise<User[]> {
        return this.read();
    }

    async getByEmail(email: string): Promise<User | undefined> {
        const users = await this.read();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    async getById(id: string): Promise<User | undefined> {
        const users = await this.read();
        return users.find(u => u.id === id);
    }

    async create(user: User): Promise<void> {
        const users = await this.read();
        users.push(user);
        await this.write(users);
    }
}

export const userRepository = new UserRepository();
