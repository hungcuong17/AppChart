
const UserService = require('./user.service')

exports.register = async (req, res) => {
    try {
        let data = await UserService.register(req.body);
        if(data==='have_exist'){
            res.status(400).json({success: false, messages: ['email_have_exist'], content: {inputData: req.body}});
        }
        res.status(200).json({success: true, messages: ['register_success'], content: data});
    } catch (error) {
        res.status(400).json({success: false, messages: ['register_faile'], content: {error: error}});
    }
}
exports.login = async (req, res) => {
    try {
        let data = await UserService.login(req.body);
        if(data ===false){
            res.status(400).json({success: false, messages: ['invali_emai_or_password'], content: {inputData: req.body}});
        } else{
            res.status(200).json({success: true, messages: ['login_success'], content: data});
        }
    } catch (error) {
        res.status(400).json({success: false, messages: ['login_faile'], content: {error: error}});
    }
}

exports.forgetPassword = async (req, res) => {
    try {
        let data = await UserService.forgetPassword(req.body.email);
        if(data ===false){
            res.status(400).json({success: false, messages: ['invali_emai_or_password'], content: {inputData: req.body}});
        } else{
            res.status(200).json({success: true, messages: ['forget_password_success'], content: data});
        }
    } catch (error) {
        res.status(400).json({success: false, messages: ['forget_password_faile'], content: {error: error}});
    }
}

exports.logout = async (req, res) => {
    try {
        let data = await UserService.logout(req.body);
        res.status(200).json({success: true, messages: ['logout_success'], content: data});
    } catch (error) {
        res.status(400).json({success: false, messages: ['logout_faile'], content: {error: error}});
    }
}

exports.editPassWord = async (req, res) => {
    try {
        let data = await UserService.editPassWord(req.params.id, req.body);
        if(data ===false){
            res.status(400).json({success: false, messages: ['old_password_error'], content: {inputData: req.body}});
        } else{
            res.status(200).json({success: true, messages: ['edit_password_success'], content: data});
        }
    } catch (error) {
        res.status(400).json({success: false, messages: ['edit_password_faile'], content: {error: error}});
    }
}

exports.editUser = async (req, res) => {
    try {
        let avatar = "";
        if (req.file !== undefined) {
            avatar = `/${req.file.path}`;
        }
        let data = await UserService.editUser(req.params.id, req.body, avatar);
        res.status(200).json({success: true, messages: ['edit_user_success'], content: data});
    } catch (error) {
        res.status(400).json({success: false, messages: ['edit_user_faile'], content: {error: error}});
    }
}



/**
 * Lấy thông tin người dùng theo name
 */
exports.getUser = async (req, res) => {
    try {
        let data = await UserService.getUser(req.params.name);
        res.status(200).json({success: true, messages: ['get_user_success'], content: data});
    } catch (error) {
        res.status(400).json({success: false, messages: ['get_user_faile'], content: {error: error}});
    }
}

/**
 * Lấy danh sách bạn bè
 */
exports.getFriend =  async (req, res) =>{
    try {
        let data = await UserService.getFriend(req.params.id, req.params.status);
        res.status(200).json({success: true, messages: ['get_friend_success'], content: data});
    } catch (error) {
        res.status(400).json({success: false, messages: ['get_friend_faile'], content: {error: error}});
    }
}

/**
 * Huỷ kết bạn
 */
exports.deleteFriend =  async (req, res) =>{
    try {
        let data = await UserService.deleteFriend(req.params.id, req.body);
        res.status(200).json({success: true, messages: ['delete_friend_success'], content: data});
    } catch (error) {
        res.status(400).json({success: false, messages: ['delete_friend_faile'], content: {error: error}});
    }
}

// TODO: làm lại bằng socket(realtime)
/**
 * Thêm mới bạn bè
 */
// exports.addFriend =  async (req, res) =>{
//     try {
//         let data = await UserService.addFriend(req.body);
//         res.status(200).json({success: true, messages: ['add_friend_success'], content: data});
//     } catch (error) {
//         res.status(400).json({success: false, messages: ['add_friend_faile'], content: {error: error}});
//     }
// }
