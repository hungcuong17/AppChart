const path = require('path'); // TODO: xoá sau
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');
const Chat = require('./models/chat');

require('dotenv').config()
// APP
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// import router
const userRoute = require('./modules/user/user.route');

// set static foder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload', express.static('upload'));

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// Connect to MongoDB
const db = process.env.DATABASE; // DB Config
const connect = mongoose.connect(
        db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));


io.on('connection', (socket) => {

    // Thay đổi statusLogin người dùn khi đăng nhập thành công và lấy lại danh sách bạn bàn
    socket.on('online', async (id) => {
        await User.findOneAndUpdate({_id: id}, {$set: {statusLogin: "on"}})
    });

    // Thay đổi statusLogin người dùng khi thoắt ứng dụng và lấy lại danh sách bạn bè
    socket.on('offline', async (id) => {
        await User.findOneAndUpdate({_id: id}, {$set: {statusLogin: "off"}})
    });

    // data truyền vào: senderId và receiverId là _id của người gửi và người nhân
    socket.on('joinChat', async (data)=>{
        let chatInfo = await Chat.findOne({senderId: data.senderId, receiverId: data.receiverId})
        if(chatInfo === null){
            await Chat.create({senderId: data.senderId, receiverId: data.receiverId, messages: []})
        }
    })

    // data tryền vào: senderId, receiverId:
    socket.on('input_create_message', async (data) => {
        try {
            let chatInfo = await Chat.findOne({senderId: data.senderId,receiverId: data.receiverId});
            let chatInfo2 = await Chat.findOne({senderId: data.receiverId,receiverId: data.senderId})
            let message = {content: data.content, type: data.type, time: data.time};
            chatInfo.messages.push(message);
            chatInfo2.messages.push(message);
            chatInfo.save();
            chatInfo2.save();

            let newChat = {messages: [message] }
            let res = {success: true, messages: ['create_message_success'], content: newChat}
            io.sockets.emit('output_create_message', res)
        } catch (error) {
            let res = {success: false, messages: ['create_message_faile'], content: {error: error}}
            io.sockets.emit('output_create_message', res)
        }
    })
    socket.on('disconnect', () => {
        console.log('User had left');
    })
})

// render api 
app.use('/api/user', userRoute);

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server up and running on: ${port} !`));