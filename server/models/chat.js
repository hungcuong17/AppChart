const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    person1: {
        type: Schema.Types.ObjectId,
        ref: User,
        require: true,
    },
    per: {
        type: Schema.Types.ObjectId,
        ref: User,
        require: true,

    },
    messages: [{
        senderId:{
            
        },
        content: {
            type: String
        },
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'call_video', 'call'],
        },
        time: {
            type: Date
        }
    }]
}, {
    timestamps: true
});

module.exports = Chat = mongoose.model("chats", ChatSchema);