export class EncryptTool {
    public static TAG: number = 0x77;
    public static HEADER_LENGTH_SIZE: number = 4; // 包头长度可以存储2字节的数据长度和2字节的message index

    public static encryptData(dataBuffer: ArrayBuffer, msgIndex: number): ArrayBuffer {
        const data = new Uint8Array(dataBuffer);
        const totalLength = 1 + EncryptTool.HEADER_LENGTH_SIZE + data.length;
        const buffer = new ArrayBuffer(totalLength);
        const view = new DataView(buffer);

        // 设置tag，起始包头,占用1个字节
        view.setUint8(0, EncryptTool.TAG);
        // 写入数据长度，占用两个字节
        view.setUint16(1, data.length, true);
        // 写入索引，占用两个字节
        view.setUint16(3, msgIndex, true);
        // 复制原始数据到新buffer中
        new Uint8Array(buffer, 1 + EncryptTool.HEADER_LENGTH_SIZE).set(data);
        return buffer;
    }

    public static decryptData(receiveBuffer: ArrayBuffer): [boolean, Uint8Array | null, number, number] {
        if (receiveBuffer.byteLength < 1 + this.HEADER_LENGTH_SIZE) {
            return [false, null, 0, 0];  // 数据不足以解析出标记和头部信息。
        }

        const view = new DataView(receiveBuffer);
        const tag = view.getUint8(0);

        if (tag !== EncryptTool.TAG) {
            // 数据不合法或未找到正确的tag
            return [false, null, 0, 0];
        }

        const dataLength = view.getUint16(1, true);
        const msgIndex = view.getUint16(3, true);

        if (receiveBuffer.byteLength < 1 + EncryptTool.HEADER_LENGTH_SIZE + dataLength) {
            return [false, null, 0, msgIndex];  // 数据包不完整
        }

        const dataStartPos = 1 + EncryptTool.HEADER_LENGTH_SIZE;
        const decryptedData = new Uint8Array(
            receiveBuffer.slice(dataStartPos, dataStartPos + dataLength)
        );

        return [true, decryptedData, dataStartPos + dataLength, msgIndex];
    }
}
