import IPlatform from "./IPlatform";
import IProto from "./proto/IProto";
import Proto_Dynamic from "./proto/Proto_Dynamic";
import Proto_Static from "./proto/Proto_Static";

export default class Platform implements IPlatform {
    /**proto初始化的参数**/
    protected proto_data: any;
    /**proto完成回调**/
    protected protoComplete: Function;
    /**使用静态proto,否则使用动态proto**/
    protected useStaticProto: boolean = true;

    initializeProto() {
        var proto: IProto = this.useStaticProto ? new Proto_Static() : new Proto_Dynamic();
        proto.initialize(this.proto_data, this.protoComplete);
        return proto;
    }
}