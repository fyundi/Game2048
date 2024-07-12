import { _decorator, Component, EventKeyboard, input, Input, KeyCode, Node } from 'cc';
import GlobalConfig from '../common/core/GlobalConfig';
import App from '../common/core/App';
import Platform from '../common/core/Platform';
import Log from '../common/core/log/Log';
import { WebSocketClient } from '../common/net/WebSocketClient';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        GlobalConfig.isRelease = false;
        this.addEvent();
        App.initialize(new Platform(), this.onAppInited.bind(this));
    }

    addEvent() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        // switch(event.keyCode) {
        //     case KeyCode.KEY_A:
        //         console.log('Press a key');
        //         break;
        // }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                Log.print('Release a key');
                this.sendTest("Click A!!!");
                break;
            case KeyCode.KEY_Q:
                Log.print('Release Q key');
                this.httpConfig();
                break;
            case KeyCode.KEY_D:
                Log.print('Release D key');
                let param = {
                    type: "json",
                    data: "httpTestData json"
                }
                this.httpTestData(param);
                break;
            case KeyCode.KEY_S:
                Log.print('Release S key');
                let param2 = new FormData();
                param2.append("type", "FormData");
                param2.append("data", "httpAuth FormData");
                this.httpAuth(param2);
                break;
            case KeyCode.KEY_W:
                Log.print('Release W key');
                let param3 = new FormData();
                param3.append("type", "FormData");
                param3.append("data", "httpAuth FormData");
                this.asyncHttpAuth(param3);
                break;
            case KeyCode.KEY_R:
                Log.print('Release R key');
                let param4 = new FormData();
                param4.append("username", "darker001");
                param4.append("password", "123456");
                this.asyncRegister(param4);
                break;
        }
    }

    private httpConfig(param?: any) {
        App.http.doGet("http://localhost:8199/service/config", {}, (err, res) => {
            Log.print("httpTest:", res);
        });
    }

    private httpTestData(param?: any) {
        App.http.doPost("http://localhost:8199/service/test", param, (err, res) => {
            Log.print("httpTest:", res);
        });
    }

    private httpAuth(param?: any) {
        App.http.doPost("http://localhost:8199/auth/register", param, (err, res) => {
            Log.print("httpTest2 succ:", res);
        }, (err, res) => {
            Log.print("err");
        });
    }

    private async asyncHttpAuth(param?: any) {
        let res = await App.http.asyncPost("http://localhost:8199/auth/register", param);
        Log.print("asyncHttpAuth:", res);
    }

    private async asyncRegister(param?: any) {
        let res = await App.http.asyncPost("http://localhost:8199/auth/register", param);
        Log.print("asyncRegister:", res);
    }

    private sendTest(msg: string) {
        if (!this.connected) return;
        const sampleData = { message: msg };
        const jsonData = JSON.stringify(sampleData);
        App.net.sendJson(jsonData);
    }

    private onAppInited() {
        Log.print("---onAppInited----");

        let socketClient = new WebSocketClient();
        let connectOptions = {
            url: "ws://localhost:4263", // 连接URL
            connectedCallback: this.onWebSocketConnected.bind(this)
        };
        App.net.initNode(socketClient);
        App.net.connect(connectOptions);
    }

    private connected: boolean = false;
    private onWebSocketConnected() {
        Log.print("----连接成功----")
        this.connected = true;
    }

}

