// src/core/RouteRegistry.ts
import { Application } from 'express';
import { AuthRoutes } from '../routes/AuthRoutes';
import { ServiceRoutes } from '../routes/ServiceRoutes';

export class RouteRegistry {
    constructor(private app: Application) { }

    public registerRoutes(): void {
        this.app.use('/auth', new AuthRoutes().router); // 使用分离出来的路由
        this.app.use('/service', new ServiceRoutes().router); // 使用分离出来的路由
    }
}
