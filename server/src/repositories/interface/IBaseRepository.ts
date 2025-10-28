import { ClientSession, Document, FilterQuery } from 'mongoose';
import { DeepPartial } from '../../types/SubscriptionType';

export interface ModelUpdateOptions {
    new?: boolean;
    upsert?: boolean;
    runValidators?: boolean;
}

export interface IBaseRepository<T extends Document> {
    create(item: Partial<T>): Promise<T>;
    update(id: string, data: DeepPartial<T>): Promise<T>;
    delete(id: string, session?: ClientSession): Promise<boolean>;
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    findByIdAndUpdate(id: string, update: Partial<T>, options?: ModelUpdateOptions): Promise<T | null>;
    find(filter: FilterQuery<T>): Promise<T[]>;
    findOne(filter: FilterQuery<T>): Promise<T | null>;
    findOneAndUpdate(filter: FilterQuery<T>, update: Partial<T>, options?: ModelUpdateOptions): Promise<T | null>;
    save(document: T): Promise<T>;
    deleteMany(filter: FilterQuery<T>): Promise<number>;
    deleteOne(filter: FilterQuery<T>, session?: ClientSession): Promise<boolean>;
    count(filter: Record<string, unknown>): Promise<number>;
    insertMany(items: Partial<T>[], options?: { session?: ClientSession }): Promise<T[]>
    aggregate(pipeline: any[]): Promise<any[]>;
}