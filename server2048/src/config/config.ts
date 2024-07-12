// src/config/ConfigLoader.ts
import fs from 'fs';
import path from 'path';
import { Logger } from '../utils/Logger';

export class ConfigLoader {
    private static configFile: string;
    private static config: Record<string, any>;

    public static initialize(env: string): void {
        ConfigLoader.configFile = `config.${env}.json`;
        // 在同一目录下查找配置文件，因此简化路径构建
        const configPath = path.resolve(__dirname, ConfigLoader.configFile);

        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuration file '${ConfigLoader.configFile}' not found.`);
        }

        const fileContent = fs.readFileSync(configPath, 'utf8');
        ConfigLoader.config = JSON.parse(fileContent);
    }

    public static get(key: string): any {
        if (!ConfigLoader.config) {
            throw new Error('Configuration has not been initialized yet.');
        }

        return ConfigLoader.config[key];
    }

    // 获取基础URL
    public static getHttpUrl(): string {
        return `http://${ConfigLoader.get("domain")}:${ConfigLoader.get("httpPort")}`;
    }

    // 获取WebSocket的完整URL
    public static getWebSocketUrl(): string {
        return `ws://${ConfigLoader.get("domain")}:${ConfigLoader.get("wsPort")}`;
    }
}
