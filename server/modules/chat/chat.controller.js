
const ChatService = require('./chat.service')

exports.getListChat = async (req, res) => {
    try {
        console.log("sdawdawd");
        var data = await ChatService.getChats(req.params.id);
        res.status(200).json({success: true, messages: ['get_list_chat_success'], content: data});
    } catch (error) {

        res.status(400).json({success: false, messages: ['get_list_chat_faile'], content: {error: error}});
    }
}
