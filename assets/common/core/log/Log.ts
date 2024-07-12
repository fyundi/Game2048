export default class Log {

    public static enable: boolean = true;
    public static print(message?: any, ...optionalParams: any) {
        if (Log.enable) {
            console.log(this.getDateString(), message, ...optionalParams);
        }
    }

    public static warn(message?: any, ...optionalParams: any) {
        if (Log.enable) {
            console.warn(this.getDateString(), message, ...optionalParams);
        }
    }

    public static error(message?: any, ...optionalParams: any) {
        if (Log.enable) {
            console.error(this.getDateString(), message, ...optionalParams);
        }
    }

    public static writeToJson(data: any, tag: string = "normal"): void {
        if (Log.enable) {
            this.writeLog(JSON.stringify(data), tag);
        }
    }

    public static writeLog(msg: string, tag: string = "normal"): void {
        if (Log.enable) {
            //TODO 向服务器写日志
        }
    }

    private static stack(index: number): string {
        var e = new Error();
        var lines = e.stack!.split("\n");
        var result: Array<any> = [];
        lines.forEach((line) => {
            line = line.substring(7);
            var lineBreak = line.split(" ");
            if (lineBreak.length < 2) {
                result.push(lineBreak[0]);
            }
            else {
                result.push({ [lineBreak[0]]: lineBreak[1] });
            }
        });

        var list: string[] = [];
        var splitList: Array<string> = [];
        if (index < result.length - 1) {
            var value: string;
            for (var a in result[index]) {
                var splitList = a.split(".");

                if (splitList.length == 2) {
                    list = splitList.concat();
                }
                else {
                    value = result[index][a];
                    var start = value!.lastIndexOf("/");
                    var end = value!.lastIndexOf(".");
                    if (start > -1 && end > -1) {
                        var r = value!.substring(start + 1, end);
                        list.push(r);
                    }
                    else {
                        list.push(value);
                    }
                }
            }
        }

        if (list.length == 1) {
            return "[" + list[0] + ".ts]";
        }
        else if (list.length == 2) {
            return "[" + list[0] + ".ts->" + list[1] + "]";
        }
        return "";
    }

    private static getDateString(): string {
        let d = new Date();
        let str = d.getHours().toString();
        let timeStr = "";
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getMinutes().toString();
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getSeconds().toString();
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getMilliseconds().toString();
        if (str.length == 1) str = "00" + str;
        if (str.length == 2) str = "0" + str;
        timeStr += str;

        timeStr = "[" + timeStr + "]";
        return timeStr;
    }
}