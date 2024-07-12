// src/AppServer.ts
import express, { Express } from 'express';
import { HttpProxy } from './core/HttpProxy';
import { RouteRegistry } from './core/RouteRegistry';
import { ConfigLoader } from './config/config';
import { monitor } from '@colyseus/monitor';
import { createServer } from 'http';
import { DatabaseConnector } from './config/db';

/** 环境变量设置 */
export enum EnvMode {
    dev = "dev",
    prod = "prod"
}

export class AppServer {
    private static app_env_mode = EnvMode.dev;

    constructor() {
        this.initConfig();
    }

    private initConfig(): void {
        ConfigLoader.initialize(AppServer.app_env_mode);
    }

    public async start(): Promise<void> {
        try {
            // Connect to the database
            await DatabaseConnector.connect();
            
            //启动http服务及相关设置
            const app = express();
            const httpProxy = new HttpProxy(app);
            httpProxy.setupMiddlewares();

            const routeRegistry = new RouteRegistry(app); // 创建RouteRegistry实例
            routeRegistry.registerRoutes(); // 注册所有路由

            // 创建一个分离的HTTP服务器实例，不包含WebSocket服务
            const httpServer = createServer(app);

            // 可选地添加Colysues监控面板（推荐只在开发环境中使用）
            if (AppServer.app_env_mode !== 'prod') {
                app.use("/colyseus", monitor());
            }

            // 仅使用HTTP服务器监听特定端口
            const httpPort: number = ConfigLoader.get('httpPort');
            httpServer.listen(httpPort, () => {
                console.log(`HTTP server is listening on http://localhost:${httpPort}`);
            });
        } catch (error) {
            console.error('Error during application initialization:', error);
            process.exit(1);
        }
    }
}
