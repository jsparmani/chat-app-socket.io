const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();

var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', function (socket) {
    console.log("New user connected");

    socket.on('join', function (params, callback) {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback('Name and room name are required');
        }

        socket.join(params.room);
        // Leave a room  socket.leave(params.room)


        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));

        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
        callback();
    });

    socket.on('createMessage', function (message, callback) {
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();


    });

    socket.on('createLocationMessage', function (coordinates) {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coordinates.latitude, coordinates.longitude));
    });

    socket.on('disconnect', function () {
        console.log("User was disconnected");
    });
});

server.listen(port, function () {
    console.log(`Server is up on port ${port}`);
});


