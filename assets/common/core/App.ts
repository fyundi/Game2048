import { NetManager } from "../net/NetManager";
import IPlatform from "./IPlatform";
import HttpMgr from "./http/HttpMgr";
import IProto from "./proto/IProto";

export default class App {
    public static get net(): NetManager { return NetManager.instance }
    public static get http(): HttpMgr { return HttpMgr.instance }

    public static proto: IProto;

    public static initialize(platform: IPlatform, complete?: Function): void {
        this.proto = platform.initializeProto();
        complete?.();
    }
}