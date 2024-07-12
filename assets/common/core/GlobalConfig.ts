export default class GlobalConfig {
    /**正式环境**/
    public static isRelease: boolean = true;

    public static logExclude: string[] = ["gamemsg.Ping", "gamemsg.Pong"];
}
