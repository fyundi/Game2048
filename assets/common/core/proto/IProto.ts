export default interface IProto {
    /**
     * 
     * @param data 静态proto传包名数组
     * @param complete 初始化完成回调
     */
    initialize(data: any, complete?: Function): void;

    /**
     * 
     * @param data 数据对象
     * @param path 路径，动态proto需要，静态proto不需要
     */
    encode(data: any, path: string): Uint8Array;

    /**
     * 
     * @param className 类名 全路径 
     * @param data 解码数据
     */
    decode(className: string, data: Uint8Array | ArrayBuffer): any;

    /**
     * 
     * @param data 静态proto传静态js里面的对象
     */
    // getFullPath(data: any): string;
}