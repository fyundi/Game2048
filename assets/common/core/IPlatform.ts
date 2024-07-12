import IProto from "./proto/IProto";

export default interface IPlatform {
    /**初始化proto**/
    initializeProto(): IProto;
}