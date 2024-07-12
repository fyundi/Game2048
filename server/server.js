const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
    console.log('A new client Connected!');

    ws.send('Welcome New Client!');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);

        // 回显收到的消息
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', function close() {
        console.log('Disconnected.');
    });
});

console.log('WebSocket server is running on ws://localhost:3000');
