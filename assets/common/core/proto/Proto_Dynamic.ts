import IProto from "./IProto";

export default class Proto_Dynamic implements IProto {
    private root: any;
    private complete: Function;

    initialize(list: string[], complete?: Function): void {
        this.complete = complete;
        //@ts-ignore
        protobuf.load(list, this.loadComplete.bind(this));
    }

    private loadComplete(err: any, root: any): void {
        if (err) throw err;
        this.root = root;
        this.complete && this.complete();
    }

    encode(data: any, path: string): Uint8Array {
        var type = this.root.lookupType(path);
        var message = type.create(data);
        var errMsg = type.verify(message);
        if (errMsg) throw errMsg;
        return type.encode(message).finish();
    }

    decode(path: string, data: Uint8Array | ArrayBuffer): any {
        var type = this.root.lookup(path);
        if (type) {
            return type.decode(data instanceof ArrayBuffer ? new Uint8Array(data) : data);
        }
        return null;
    }
    // getFullPath(data: any): string {
    //     return "";
    // }

}