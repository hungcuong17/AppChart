const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const generator = require("generate-password");
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');

exports.register = async (data) => {
    console.log(data);
    const {userName, email, password} = data;
    var salt = bcrypt.genSaltSync(10);
    var passwordHash = bcrypt.hashSync(password, salt);
    let user = await User.findOne({email});
    if(user) {
        return 'have_exist'
    } else{
        const newUser = new User({userName, email, password});
        return await User.create({
            userName: userName,
            email: email,
            password: passwordHash
        });
    }
}

exports.login =async(data)=>{
    const {email, password} = data;
    let user = await User.findOne({email: email});
    if(!user)
        return false;
    if(!bcrypt.compareSync(password, user.password))
        return false;
    const token = await jwt.sign(
        {
            _id: user._id, 
            email: user.email, 
            password:user.password
        }, 
        process.env.TOKEN_SECRET
    );
    user.tokens.push(token);
    user.save();
    return user;
}
/**
 * Quên mật khẩu tài khoản người dùng
 * @email: email người dùng
 */
exports.forgetPassword = async (email) => {
    var user = await User.findOne({ email });
    if(user === null){
        return false;
    } else {
        var newPassword = await generator.generate({ length: 6, numbers: true });
        var salt = bcrypt.genSaltSync(10);
        var passwordHash = bcrypt.hashSync(newPassword, salt);
        user.tokens = [];
        user.password=passwordHash;
        user.save();

        var transporter = await nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: 'appchat8888@gmail.com', pass: 'appchat@123' }
        });
        var mainOptions = {
            from: 'appchat8888@gmail.com',
            to: email,
            subject: 'APPCHAT : Thay đổi mật khẩu - Change password',
            html: `
            <div style="
                background-color:azure;
                padding: 100px;
                text-align: center;
            ">
                <h3>
                    Bạn đã yêu cầu lấy lại mật khẩu
                </h3>
                <p>Mật khẩu mới là: <b style="color: red">${newPassword}</b></p>
            </div>
            `
        }
        await transporter.sendMail(mainOptions);
        return true;
    }
}



exports.logout = async(data) =>{
    const {id, tokens} = data;
    let user = await User.findOne({_id: id});
    user.tokens.pull(tokens);
    user.save();
    return user;
}

exports.editPassWord = async(id, data)=>{
    const {oldPassword, newPassword} = data;
    let user = await User.findById(id);
    if(!bcrypt.compareSync(oldPassword, user.password)){
        return false;
    }
    var salt = bcrypt.genSaltSync(10);
    var passwordHash = bcrypt.hashSync(newPassword, salt);
    user.password = passwordHash;
    user.save();

    return user;
}

exports.editUser = async(id, data, avatar)=>{
    console.log(avatar);
    let user = await User.findById(id);
    user.email = data.email;
    user.userName = data.userName;
    if (avatar !== "") {
        user.avatar = avatar;
    }
    user.save();
    return user;
}
/**
 * Lấy Danh sách người dùng theo name tìm kiếm
 */
exports.getUser = async(userName)=>{
    return await User.find({
        userName: {
            $regex: userName,
            $options: "i"
    }}, {_id: 1, avater: 1, userName:1, email:1});
}

/**
 * Lấy danh sách bạn bè
 */
exports.getFriend = async(id, status) =>{
    let user = await User.findOne({_id: id}, {friends: 1, friendRequests: 1, friendResponses: 1});
    let data=[];
    if(status === "friend"){
        data = user.friends;
        if(data.length !==0){
            for(let n in data){
                data[n] = await User.findOne({_id:data[n]}, {_id: 1, avater: 1, userName: 1, email: 1, statusLogin: 1, timeLogout: 1})
            }  
        }
    } else if(status==='request'){
        data = user.friendRequests;
        if(data.length !==0){
            for(let n in data){
                data[n] = await User.findOne({_id: data[n].userId}, {_id: 1, avater: 1, userName: 1, email: 1, statusLogin: 1, timeLogout: 1})
            }
        }
    } else if(status==='response'){
        data = user.friendResponses;
        if(data.length !==0){
            for(let n in data){
                data[n] = await User.findOne({_id:data[n]}, {_id: 1, avater: 1, userName: 1, email: 1, statusLogin: 1, timeLogout: 1})
            }  
        }
    }
    return data;
}



/**
 * Huỷ kết bạn
 */
exports.deleteFriend =async (id, data) =>{
    let user = await User.findById(id);
    user.friends.pull(data.idFriend);
    user.save();
    return user;
}

// TODO: làm lại bằng socket(realtime)
/**
 * Thêm bạn bè
 */
// exports.addFriend = async(data) =>{
//     let user = await User.findById(data.id);
//     user.friends.push(data.idFriend);
//     user.friendRequests.pull(data.idFriend);
//     user.save();
//     return user;
// }


