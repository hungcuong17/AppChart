const express = require("express");
const router = express.Router();

const ChatController = require('./chat.controller');

// Api lấy dánh sách cuộc hội thoại theo id người dùng
router.get('/:id', ChatController.getListChat);

//




module.exports = router;