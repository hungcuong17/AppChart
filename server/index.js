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
    socket.on('online', async (id) => {
        await User.findOneAndUpdate({_id: id}, {$set: {statusLogin: "on"}});
        let chats = await Chat.find({$or: [{person1: id}, {person2: id}]},{ _id: 1});
        chats = chats.map(x=>x._id);
        chats.forEach(x=>{
            socket.join(x);
        })
        socket.join(id);
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

    // bắt sự kiện click vào cuộc hội thoại(cuộc chat) khi 2 người chưa phải bạn bè
    // data truyền vào: senderId và receiverId là _id của người gửi và người nhận và type=0 hoặc 1 là loại cuộc chat
    socket.on('createNewChat', async (data)=>{
        let chat = await Chat.findOne({person1: data.senderId, person2: data.receiverId});
        let chat1 = await Chat.findOne({person1: data.receiverId, person2: data.senderId});
        if(chat===null && chat1===null){
            let chatInfo = await Chat.create({person1: data.senderId, person2: data.receiverId, messages:[]})
            socket.join(chatInfo._id);
            let res = {success: true, messages: ['create_chat_success'], content: chatInfo};
            io.to(chatInfo._id).emit('outCreateNewChat', res);
            io.to(data.receiverId).emit('outCreateNewChat', res);
        }
    })

    // Tạo mới tin nhắn
    // data tryền vào: senderId là id người gửi, chatID là id phòng chat, content, type
    socket.on('input_create_message', async (data) => {
        let chat = await Chat.findById(data.chatID);
        let message = {senderId: data.senderId, content: data.content, type: data.type, timeSend: Date.now()};
        chat.messages.push(message);
        chat.status ='new',
        chat.save();
        io.to(data.chatID).emit('output_create_message', chat);
    })

    // Gửi yêu cầu kết bạn senderId và receiverId là _id của người gửi và người nhận
    socket.on("send_request_add_friend", async (data)=>{
        let user1 = await User.findById(data.senderId);
        let user2 = await User.findById(data.receiverId);
        user1.friendResponses.push(data.receiverId);
        user2.friendRequests.push({userId:data.senderId, status:'new'});
        user1.save();
        user2.save();
        io.to(data.receiverId).emit("out_send_request_add_friend", user2);
        socket.emit("out_send_request_add_friend", user1);
    })

    // Đồng ý kết bạn senderId và receiverId là _id của người chấp nhận kết bạn và người được đồng ý kết bạn
    socket.on("accept_add_friend", async (data)=>{
        let user1 = await User.findById(data.senderId);
        let user2 = await User.findById(data.receiverId);
        user1.friends.push(data.receiverId);
        user2.friends.push(data.senderId);
        user1.friendRequests.filter(x=>x.userId!==data.receiverId);
        user2.friendResponses.pull(data.senderId);
        user1.save();
        user2.save();
        io.to(data.receiverId).emit("out_accept_add_friend", user2);
        socket.emit("out_accept_add_friend", user1);
    })

    
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