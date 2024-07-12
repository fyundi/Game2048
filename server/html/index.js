const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const statusDisplay = document.getElementById('status');

let webSocket;

function connect() {
    webSocket = new WebSocket('ws://localhost:3000');

    webSocket.onopen = function(event) {
        statusDisplay.textContent = 'Connected';
        connectButton.disabled = true;
        disconnectButton.disabled = false;
        console.log('WebSocket Open', event);
    };

    webSocket.onmessage = function(event) {
        console.log('WebSocket Message', event.data);
    };

    webSocket.onerror = function(event) {
        console.error('WebSocket Error', event);
    };

    webSocket.onclose = function(event) {
        statusDisplay.textContent = 'Disconnected';
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        console.log('WebSocket Close', event);
    };
}

function disconnect() {
    if (webSocket) {
        webSocket.close();
    }
}

connectButton.addEventListener('click', connect);
disconnectButton.addEventListener('click', disconnect);
