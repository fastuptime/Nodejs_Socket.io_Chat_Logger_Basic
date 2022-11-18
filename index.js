const express = require('express');
const app = express();
const socket = require('socket.io');
const fs = require('fs');
const moment = require('moment');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const server = app.listen(3000, () => {
    console.log('listening on port 3000');
});

const io = socket(server, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

function messageLog(user, message) {
    let time = moment().format("YYYY-MM-DD HH:mm:ss");
    let log = `[${time}] (${user}) --> ${message}

`;
    fs.appendFile('messageLog.txt', log, (err) => {
        if (err) throw err;
    });
}

io.on('connection', (socket) => {
    console.log('made socket connection', socket.id);

    socket.on('chat', (data) => {
        messageLog(data.handle, data.message);
        io.sockets.emit('chat', data);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });
});