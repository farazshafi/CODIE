import { Model, Document, FilterQuery } from 'mongoose';
import { IBaseRepository } from './interface/IBaseRepository';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(item: Partial<T>): Promise<T> {
        return this.model.create(item);
    }

    async update(id: string, item: Partial<T>, options?: any): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, item, { ...options, new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id);
    }

    async findAll(): Promise<T[]> {
        return this.model.find();
    }

    async findByIdAndUpdate(
        id: string,
        update: Partial<T>,
        options?: any
    ): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, { ...options, new: true });
    }
}