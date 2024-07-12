export type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView);

//网络连接配置
export interface NetConnectOptions {
    host?: string,              // 地址
    port?: number,              // 端口
    url?: string,               // url，与地址+端口二选一
    autoReconnect?: number,     // -1 永久重连，0不自动重连，其他正整数为自动重试次数
    connectedCallback?: Function, //连接成功后回调
    enableFrameProcessing?: boolean       //是否需要分帧处理
}

// Socket接口
export interface ISocket {
    connect(options: any);                  // 连接接口
    send(buffer: NetData);                  // 数据发送接口
    close(code?: number, reason?: string);  // 关闭接口

    onConnected: (event) => void;           // 连接回调
    onMessage: (msg: NetData) => void;      // 消息回调
    onError: (event) => void;               // 错误回调
    onClosed: (event) => void;              // 关闭回调
}
