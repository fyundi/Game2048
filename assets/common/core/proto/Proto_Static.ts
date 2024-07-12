import Log from "../log/Log";
import IProto from "./IProto";

export default class Proto_Static implements IProto {
    private map: any = {};

    initialize(list: string[], complete?: Function): void {
        var len: number = list ? list.length : 0;
        for (var i: number = 0; i < len; i++) {
            this.parse(list[i]);
        }
        complete && complete();
    }

    private parse(packageName: string): void {
        var obj: any = this.getObj(packageName);
        var cls: any;
        var path: string;
        for (var key in obj) {
            cls = obj[key];
            if (typeof cls == "function") {
                path = packageName + "." + key;
                if (!this.map[path]) {
                    this.map[path] = { path: path, cls: cls };
                } else {
                    // throw new Error("proto repeat " + path);
                    Log.print("proto repeat " + path)
                }
            }
        }
    }

    private getObj(packageName: string): any {
        var obj: any = null;
        var list: string[] = packageName.split(".");
        var len: number = list.length;
        var key: string;
        for (var i: number = 0; i < len; i++) {
            key = list[i];
            obj = obj ? obj[key] : window[key];
        }
        return obj;
    }

    encode(data: any, path: string): Uint8Array {
        var cls: any = this.map[path].cls;
        return cls.encode(data).finish();
    }

    decode(className: string, data: Uint8Array | ArrayBuffer) {
        var item: any = this.map[className];
        if (item) {
            var cls: any = item.cls;
            return cls.decode(data instanceof ArrayBuffer ? new Uint8Array(data) : data);
        }
        return null;
    }

    // getFullPath(data: any): string {
    //     Log.print('getFullPath===>', data)
    //     return this.map[data.constructor.name].path;
    // }
}