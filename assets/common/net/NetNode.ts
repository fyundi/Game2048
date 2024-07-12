// NetNode.ts

import App from "../core/App";
import GlobalConfig from "../core/GlobalConfig";
import Log from "../core/log/Log";
import { EncryptTool } from "./EncryptTool";
import { ISocket, NetConnectOptions, NetData } from "./INets";
import { NetNodeState } from "./NetEnums";

export class NetNode {
    protected _connectOptions: NetConnectOptions = null;
    protected _isSocketInit: boolean = false;
    protected _isSocketOpen: boolean = false;
    protected _state: NetNodeState = NetNodeState.Closed;
    protected _socket: ISocket = null;
    protected _connectedCallback: Function = null;
    protected _disconnectCallback: Function = null;
    protected _reconnectTimeoutId: any = null;
    protected _reconnetTimeOut: number = 15000;  // 重连间隔
    protected _index: number = 10000;    //客户端发包标识
    protected _messageBuffer: ArrayBuffer; //当前缓冲区数据
    protected _reconnectAttemptCount: number = 0; // 重连尝试次数

    protected _completeMap = {};         // 消息回调集合
    protected _messageQueue: ArrayBuffer[] = [];  // 新增消息队列存储接收到的消息片段
    protected _sendQueue: ArrayBuffer[] = []; // 新增发送队列

    protected _enableFrameProcessing: boolean = false; //是否需要分帧处理收发数据

    public init(socket: ISocket) {
        this._socket = socket;
        this._messageBuffer = new ArrayBuffer(0);

        // 绑定 socket 的回调事件
        this._socket.onConnected = (event) => this.onConnected(event);
        this._socket.onMessage = (msg) => this.onMessage(msg);
        this._socket.onError = (event) => this.onError(event);
        this._socket.onClosed = (event) => this.onClosed(event);

        this._isSocketInit = true;
    }

    public connect(options: NetConnectOptions): boolean {
        if (!this._isSocketInit) {
            Log.error('Socket has not been initialized!');
            return false;
        }

        this._connectOptions = options;
        this._reconnectAttemptCount = options.autoReconnect ?? 0;
        this._connectedCallback = options.connectedCallback;
        this._enableFrameProcessing = options.enableFrameProcessing;

        if (this._state === NetNodeState.Connecting || this._state === NetNodeState.Working) {
            Log.print('NetNode is already connecting or working.');
            return false;
        }

        this._state = NetNodeState.Connecting;
        this._socket.connect(options);

        return true;
    }

    protected onConnected(event): void {
        this._state = NetNodeState.Working;
        this._isSocketOpen = true;
        if (this._connectedCallback) {
            this._connectedCallback();
            this._connectedCallback = null;
        }
    }

    public update() {
        if (this._state !== NetNodeState.Working) {
            return;
        }

        // 处理收到的消息队列
        while (this._messageQueue.length > 0) {
            const msgData = this._messageQueue.shift();
            this.handleMessageData(msgData);
        }

        // 发送队列中的消息处理
        while (this._sendQueue.length > 0) {
            const sendData = this._sendQueue.shift();
            this._socket.send(sendData); // 实际发送数据
        }
    }

    protected onMessage(msg): void {
        if (!msg || !msg.data || !(msg.data instanceof ArrayBuffer)) {
            Log.error('Received message is invalid or does not have a data property of type ArrayBuffer.');
            return;
        }

        // 如果开启了分帧处理，存入消息队列；否则直接处理
        if (this._enableFrameProcessing) {
            this._messageQueue.push(msg.data);
        } else {
            this.handleMessageData(msg.data);
        }
    }

    // 处理单个消息片段的方法，从update中调用
    private handleMessageData(msgData: ArrayBuffer): void {
        // 将新收到的片段添加至累积缓冲区
        this._messageBuffer = this.appendBuffer(this._messageBuffer, msgData);
        try {
            let offset = 0; // 当前处理位置的偏移量
            while (offset < this._messageBuffer.byteLength) {
                // 解析数据包
                const [isComplete, data, nextOffset, msgIndex] = EncryptTool.decryptData(this._messageBuffer.slice(offset));
                if (!isComplete) {
                    // 如果从当前偏移处无法获取完整数据包，等待后续数据
                    break;
                }
                // 能走到这一步说明有合法的数据包，则处理它
                this.runHandler(msgIndex, data);
                // 更新已处理数据后的新起始偏移量
                offset += nextOffset;
            }
            // 保留未处理的数据片段（即剩余不完整的消息部分）
            this._messageBuffer = this._messageBuffer.slice(offset);
    
        } catch (e) {
            Log.error('Error while processing the received data:', e);
            // 发生异常时重置累积缓冲区
            this._messageBuffer = new ArrayBuffer(0);
        }
    }

    protected onError(event): void {
        Log.error('Socket Error:', event);
        this._state = NetNodeState.Closed;
    }

    protected onClosed(event): void {
        console.warn('Socket Closed:', event);
        this._isSocketOpen = false;
        this._state = NetNodeState.Closed;

        // 调用断线回调
        if (this._disconnectCallback) {
            this._disconnectCallback(event.wasClean);
        }

        // 清除可能存在的所有正在等待的消息和回调
        this.clearPendingMessages();
        //前一个连接是否已关闭的检查
        if (!event.wasClean || this._reconnectTimeoutId !== null) {
            return;
        }
        // 根据配置尝试重新连接
        this.handleAutoReconnect();
    }

    // 添加用于获取节点状态的公共属性访问器
    public get state(): NetNodeState {
        return this._state;
    }

    // 实现关闭连接的功能
    public close(code?: number, reason?: string): void {
        if (this._reconnectTimeoutId) {
            clearTimeout(this._reconnectTimeoutId);
            this._reconnectTimeoutId = null;
        }
        if (this._socket) {
            this._isSocketOpen = false;  // 若实际存在更深层次的socket状态管理，请做相应更新
            this._state = NetNodeState.Closed;
            try {
                this._socket.close(code, reason);
            } catch (error) {
                Log.error('Error closing socket:', error); // 使用Log.error替代console.error
            }
        } else {
            Log.warn('No socket instance available to close.'); // 提示没有可关闭的socket实例
        }
        this.clearPendingMessages();
    }

    // 发起请求，如果当前处于重连中，进入缓存列表等待重连完成后发送
    private send(data: Uint8Array, complete: Function): boolean {
        if (this._state !== NetNodeState.Working) {
            Log.error('Cannot send data. NetNode state is not Working.');
            return false;
        }
        let buffer: ArrayBuffer = EncryptTool.encryptData(data.buffer, this._index);
        if (complete) this._completeMap[this._index] = complete;
        // 如果开启了分帧处理，将数据放入发送队列；否则直接发送
        if (this._enableFrameProcessing) {
            this._sendQueue.push(buffer); // 将消息加入发送队列
        } else {
            this._socket.send(buffer);
        }
        this._index++;
        return true;
    }

    /**以json的方式封装数据进行发送 */
    public sendJson(data: any, complete: Function = null): boolean {
        let encoder = new TextEncoder();
        let sendData = encoder.encode(JSON.stringify(data));
        return this.send(sendData, complete);
    }

    /**以pb方式数据进行发送 */
    public sendPB(path: string, data: any, complete: Function = null): boolean {
        if (!path) {
            Log.print("%c[ws-send-error]>>> sendPb is not path", "color:red", new Error().stack)
            return
        }
        if (GlobalConfig.logExclude.find((obj) => { return obj === path; }) == null) {
            Log.print("%c[ws-send]>>> %s,%s,%o ", "color:#ff00ff", path, this._index, data);
        }
        let protoAry: Uint8Array = App.proto.encode(data, path);
        return this.send(protoAry, complete);
    }

    protected appendBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
        const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    }

    // 将 runHandler 的签名更新为 handle 错误情况
    private runHandler(index: number, data: any | null, error?: Error): void {
        var complete: Function = this._completeMap[index];
        if (complete) {
            if (data) {
                complete(data);
            } else if (error) {
                complete(null, error);
            }
            delete this._completeMap[index];
        }
    }

    protected clearPendingMessages(): void {
        for (let index in this._completeMap) {
            // 如果存在未执行的返回处理函数，则执行它们
            this.runHandler(+index, null, new Error('Connection Closed'));
        }
        this._messageQueue.length = 0; // 清空消息队列
    }

    private handleAutoReconnect(): void {
        if (this._reconnectAttemptCount <= 0) {
            return;
        }

        // 如果已经设置了超时，则清除现有的
        if (this._reconnectTimeoutId) {
            clearTimeout(this._reconnectTimeoutId);
        }

        // 自动重连次数限制：这里减少次数，直到为 0 为止 (-1 表示无限)
        if (this._reconnectAttemptCount > 0) {
            this._reconnectAttemptCount--;
        }

        // 在指定的时间后尝试重新连接，可以根据实际的需求调整时间间隔
        this._reconnectTimeoutId = setTimeout(() => {
            if (!this._isSocketOpen) {
                Log.print(`Attempting to reconnect... (${this._reconnectAttemptCount} attempts left)`);
                this.connect(this._connectOptions); // 前提是_connectOptions在初始化时赋值且不会为null
            }
        }, this._reconnetTimeOut);
    }
}
