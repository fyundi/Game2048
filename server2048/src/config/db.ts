// src/config/DatabaseConnector.ts
import mongoose from 'mongoose';
import { ConfigLoader } from './config';
import { Logger } from '../utils/Logger';

export class DatabaseConnector {
    public static async connect(): Promise<void> {
        try {
            const mongoDbUri = ConfigLoader.get('mongoDbUri');
            await mongoose.connect(mongoDbUri);
            Logger.info('Successfully connected to the database.');
        } catch (error) {
            Logger.error('Database connection failed:', error);
            process.exit(1);
        }
    }
}
