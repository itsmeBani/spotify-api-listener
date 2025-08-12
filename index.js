const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectSocket = require('spotify-connect-ws');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

// spotify-connect-ws might export differently depending on version
const socketHandler =
    typeof connectSocket === 'function'
        ? connectSocket
        : connectSocket.default || connectSocket.handler;

// Attach namespace
io.of('/connect').on('connection', (socket) => {
    console.log('✅ Client connected to /connect namespace');

    // Debug: log every event from client
    socket.onAny((event, ...args) => {
        console.log('📩 From client:', event, args);
    });

    // Pass socket to spotify-connect-ws
    socketHandler(socket);

    socket.on("spotify_connect_error", (err) => {
        console.error("Spotify error:", err);
    });
    // Debug: log disconnect
    socket.on('disconnect', (reason) => {
        console.log(`❌ Client disconnected: ${reason}`);
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

server.listen(process.env.PORT || 3002, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3002}`);
});
