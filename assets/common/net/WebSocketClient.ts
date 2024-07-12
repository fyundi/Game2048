import Log from "../core/log/Log";
import { ISocket, NetConnectOptions, NetData } from "./INets";

// WebSocketClient.ts
export class WebSocketClient implements ISocket {
    private webSocket: WebSocket | null = null;
    private options: NetConnectOptions | null = null;

    public onConnected: (event) => void = null;
    public onMessage: (msg) => void = null;
    public onError: (event) => void = null;
    public onClosed: (event) => void = null;

    connect(options: NetConnectOptions): void {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            Log.warn('WebSocket is already opened.');
            return;
        }

        // 保存连接选项以备自动重连时使用
        this.options = options;

        const url = options.url || `ws://${options.host}:${options.port}`;
        this.webSocket = new WebSocket(url);
        this.webSocket.binaryType = "arraybuffer";

        this.webSocket.onopen = (event) => {
            this.onConnected(event);
            if (options.connectedCallback) {
                options.connectedCallback();
            }
        };

        this.webSocket.onerror = (event) => {
            this.onError(event);
        };

        // 注意：ArrayBuffer类型的数据可以直接通过onmessage的data属性获取
        this.webSocket.onmessage = (event) => {
            this.onMessage(event.data);
        };

        this.webSocket.onclose = (event) => {
            this.onClosed(event);
        };
    }

    send(buffer: NetData): void {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(buffer);
        } else {
            Log.warn('WebSocket is not open. Cannot send message.');
        }
    }

    close(code?: number, reason?: string): void {
        if (this.webSocket) {
            this.webSocket.close(code, reason);
        }
    }
}
