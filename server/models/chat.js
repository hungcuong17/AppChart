const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    person1: {
        type: Schema.Types.ObjectId,
        ref: User,
        require: true,
    },
    person2: {
        type: Schema.Types.ObjectId,
        ref: User,
        require: true,

    },
    name: {
        type: String,
    },
    status: {
        type: String,
        enum:['new', 'old'] // new là chat có tin mới chưa đọc, old đã đọc tất cả các tin
    },
    type: {
        type: String,
        default: 0,
        enum: ['0', '1'] // 0 là chat 2 người, 1 là chat nhóm
    },
    messages: [{
        senderId: {
            type: Schema.Types.ObjectId,
            ref: User,
            require: true,
        },
        content: {
            type: String
        },
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'call_video', 'call'],
        },
        timeSend: {
            type: Date
        }
    }]
}, {
    timestamps: true
});

module.exports = Chat = mongoose.model("chats", ChatSchema);