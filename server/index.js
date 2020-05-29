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
const chatRoute = require('./modules/chat/chat.route');

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

var userOnline =[]; // dánh sách người online
io.on('connection', (socket) => {

    // Thay đổi statusLogin người dùng khi đăng nhập thành công và gửi danh sách
    // người dùng đang online cho tất cả mọi người
    // 
    socket.on('online', async (id) => {
        console.log(id);
        await User.findOneAndUpdate({_id: id}, {$set: {statusLogin: "on"}});
        let chats = await Chat.find({$or: [{person1: id}, {person2: id}]},{ _id: 1});
        chats = chats.map(x=>x._id);
        chats.forEach(x=>{
            socket.join(x);
        })
        console.log(socket.adapter.rooms);
        userOnline.push(id);
        io.sockets.emit('get_user_online', userOnline);
        
    });

    // Thay đổi statusLogin người dùng khi thoắt ứng dụng và gửi danh sách 
    // người dùng đang online cho tất cả mọi người
    socket.on('offline', async (id) => {
        await User.findOneAndUpdate({_id: id}, {$set: {statusLogin: "off", timeLogout: Date.now()}});
        userOnline.pull(id);
        socket.broadcast.emit('get_user_online', userOnline);
    });

    // bắt sự kiện click vào cuộc hội thoại(cuộc chat)
    // data truyền vào: senderId và receiverId là _id của người gửi và người nhận
    // socket.on('joinChat', async (data)=>{
    //     let chatInfo = await Chat.findOne({senderId: data.senderId, receiverId: data.receiverId})
    //     if(chatInfo === null){
    //         await Chat.create({senderId: data.senderId, receiverId: data.receiverId, messages: []})
    //     }
    // })

    // Tạo mới tin nhắn
    // data tryền vào: senderId là id người gửi, chatID là id phòng chat, content, type
    socket.on('input_create_message', async (data) => {
        try {
            let chat = await Chat.findById(data.chatID);
            let message = {senderId: data.senderId, content: data.content, type: data.type, timeSend: Date.now()};
            chat.messages.push(message);
            chat.status ='new',
            chat.save();
            let res = {success: true, messages: ['create_message_success'], content: chat};
            io.to(data.chatID).emit('output_create_message', res);
        } catch (error) {
            let res = {success: false, messages: ['create_message_faile'], content: {error: error}}
            sockets.emit('output_create_message', res)
        }
    })

    // Gửi yêu cầu kết bạn




    socket.on('disconnect', () => {
        console.log('User had left');
    })
})

// render api 
app.use('/api/user', userRoute);
app.use('/api/chats', chatRoute);


// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server up and running on: ${port} !`));