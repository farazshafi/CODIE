import { Model, Document, FilterQuery } from 'mongoose';
import { IBaseRepository, ModelUpdateOptions } from './interface/IBaseRepository';
import { DeepPartial } from '../types/SubscriptionType';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(item: Partial<T>): Promise<T> {
        return this.model.create(item);
    }

    async update(id: string, data: DeepPartial<T>): Promise<T> {
        const updated = await this.model.findByIdAndUpdate(id, data, { new: true }).lean<T>();
        if (!updated) throw new Error("Not found");
        return updated;
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
        options?: ModelUpdateOptions
    ): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, { ...options, new: true });
    }

    async find(filter: FilterQuery<T>): Promise<T[]> {
        return this.model.find(filter);
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter);
    }
}