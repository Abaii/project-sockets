const app = require('express')();
require('dotenv').config();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const axios = require('axios');
const users = {};
const { URL } = process.env;

io.on('connection', socket => {
    socket.on('login', (data) => {
        users[socket.id] = data.userId;
        console.log(`user ${data.userId} has connected`);
    });
    socket.on('logout', () => {
        console.log(`user has disconnected ${users.length}`);
        delete users[socket.id];
    });

    socket.on('send-notification', async (data) => {
        const { receiverId, message } = data;
        const socketId = Object.keys(users).find(
          (key) => users[key] === receiverId
        );
        await axios
          .post(`${URL}/newnotification`, {
            notification_flag: true,
            id: receiverId,
          })
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
        axios.post(`${URL}/send`, { receiverId: receiverId, message: message });
        if (socketId !== -1) {
            socket.to(socketId).emit("get-noti");
        }
        
    });

});


server.listen(4000, () => 'connected');