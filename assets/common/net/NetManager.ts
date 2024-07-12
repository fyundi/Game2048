// NetManager.ts
import { ISocket, NetConnectOptions } from './INets';
import { NetNode } from './NetNode';

export class NetManager {
    private static _instance: NetManager;
    private _nodes: Map<string, NetNode>;

    private constructor() {
        this._nodes = new Map();
    }

    public static get instance(): NetManager {
        if (!NetManager._instance) {
            NetManager._instance = new NetManager();
        }
        return NetManager._instance;
    }

    // channelId 参数现在是可选的
    private getNode(channelId?: string): NetNode | undefined {
        if (channelId === undefined && this._nodes.size === 1) {
            // 如果没有提供 channelId 并且只有一个节点，返回这个节点
            let nodeEntry = this._nodes.entries().next().value;
            return nodeEntry ? nodeEntry[1] : undefined;
        }
        return this._nodes.get(channelId);
    }

    public initNode(socket: ISocket, channelId: string = 'default'): NetNode {
        let node = new NetNode();
        node.init(socket);
        this._nodes.set(channelId, node);
        return node;
    }

    // 参数 channelId 是可选的
    public connect(options: NetConnectOptions, channelId?: string): boolean {
        let node = this.getNode(channelId);
        if (!node) {
            console.error(`NetNode for channel ${channelId} has not been initialized.`);
            return false;
        }
        return node.connect(options);
    }

    // 参数 channelId 是可选的
    public sendJson(data: any, complete: Function = null, channelId?: string): boolean {
        let node = this.getNode(channelId);
        if (!node) {
            console.error(`NetNode is not available for channel ${channelId}.`);
            return false;
        }
        return node.sendJson(data, complete);
    }

    // 参数 channelId 是可选的
    public sendPB(path: string, data: any, complete: Function = null, channelId?: string): boolean {
        let node = this.getNode(channelId);
        if (!node) {
            console.error(`NetNode is not available for channel ${channelId}.`);
            return false;
        }
        return node.sendPB(path, data, complete);
    }

    // 参数 channelId 是可选的
    public close(code?: number, reason?: string, channelId?: string): void {
        let node = this.getNode(channelId);
        if (node) {
            node.close(code, reason);
        } else {
            console.error(`NetNode is not available for channel ${channelId}.`);
        }
    }

    // 参数 channelId 是可选的
    public getNodeState(channelId?: string): any {
        let node = this.getNode(channelId);
        return node ? node.state : null;
    }
}
