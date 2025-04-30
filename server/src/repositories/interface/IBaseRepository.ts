import { Document } from 'mongoose';

interface ModelUpdateOptions {
    new?: boolean;
    upsert?: boolean;
    runValidators?: boolean;
}

export interface IBaseRepository<T extends Document> {
    create(item: Partial<T>): Promise<T>;
    update(id: string, item: Partial<T>, options?: ModelUpdateOptions): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    findByIdAndUpdate(id: string, update: Partial<T>, options?: ModelUpdateOptions): Promise<T | null>;
}