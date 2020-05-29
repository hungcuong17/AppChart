const Chat = require('../../models/chat');

exports.getChats = async (id) => {
    let listChats = await Chat.find({
        $or: [{person1: id}, {person2: id}]
    });
    return listChats;
}
