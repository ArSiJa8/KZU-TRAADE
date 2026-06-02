import { BaseRepository } from './base.repository';
import type { Post } from './types';

export class PostRepository extends BaseRepository<Post> {
    constructor() {
        super('posts.json');
    }

    async getAll(): Promise<Post[]> {
        return this.read();
    }

    async getById(id: string): Promise<Post | undefined> {
        const posts = await this.read();
        return posts.find(p => p.id === id);
    }

    async create(post: Post): Promise<void> {
        const posts = await this.read();
        posts.unshift(post);
        await this.write(posts);
    }

    async update(id: string, updatedPost: Partial<Post>): Promise<boolean> {
        const posts = await this.read();
        const index = posts.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        const existingPost = posts[index];
        if (!existingPost) return false;

        posts[index] = { ...existingPost, ...updatedPost, id: existingPost.id } as Post;
        await this.write(posts);
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const posts = await this.read();
        const filteredPosts = posts.filter(p => p.id !== id);
        if (posts.length === filteredPosts.length) return false;
        
        await this.write(filteredPosts);
        return true;
    }
}

export const postRepository = new PostRepository();
