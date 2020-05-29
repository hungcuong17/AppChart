const express = require("express");
const router = express.Router();
const {uploadFile} = require('../../middleware');

const UserController = require('./user.controller');

// API Đăng ký tài khoản (data truyền vào :userName, email, password);
router.post('/register', UserController.register);

// API Đăng nhập (data truyền vào email, password);
router.post('/login', UserController.login);

// API Đăng nhập (data truyền vào email);
router.post('/forgetpassword', UserController.forgetPassword);

// API đăng xuất(dat truyền vào: id là id tài khoản muốn đăng xuất, tokens là token người dùng lưu trong localStorage)
router.post('/logout', UserController.logout);

//API Thay đổi mật khẩu(id là id tài khảo, data truyền vào: oldPassword, newPassword)
router.patch('/password/:id', UserController.editPassWord);




//Api chỉnh sửa thông tin tài khoản (id tài khoản, data truyền vào: email, userName, avatar)
router.patch('/:id',uploadFile([{name:'avatar', path:'/avatars'}], 'single'), UserController.editUser);

// API Tìm kiếm người dùng theo tên
router.get('/:name', UserController.getUser);



// Lấy danh sách bạn bè, danh sách những người đã gửi lời mời kết bạn đến người dùng đăng nhập,
// danh sách những người mà người đăn nhập đa gửi lời mời kết bạn,
// id là id người đăng nhập
// status= 'friend' là lấy danh sách bạn bè
// status = 'request' lấy danh sách những người mà tài khoản đã nhận được lời mời kết bạn từ họ
// status = 'response' lấy danh sách người dùng mà user đã gửi lời mời kết bạn đến họ

router.get('/friend/:id/:status', UserController.getFriend);

// Xoá bạn bè(huỷ kết bạn id là id của người dùng muốn huỷ kết bạn, data truyền vào: idFriend là id người bạn muốn huỷ kết bạn)
router.delete('/friend/:id', UserController.deleteFriend);

// Lấy danh sách những người đã gửi lời mời kết bạn đến người dùng đăng nhập
router.get('/friendRequest') 


// TODO: làm lại bằng socket(realtime)
// Thêm bạn bè (data truyền vào : id và idFriend )
// router.post('/friend', UserController.addFriend);





module.exports = router;