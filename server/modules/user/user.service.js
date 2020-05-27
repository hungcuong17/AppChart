const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (data) => {
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
exports.getFriend = async(id) =>{
    let user = await User.findOne({
        _id: id
    }, {friends: 1});
    
    let data = user.friends;
    if(data.length !==0){
        for(let n in data){
            console.log(data[n]);
            data[n] = await User.findOne({_id:data[n]}, {_id: 1, avater: 1, userName: 1, email: 1, statusLogin: 1})
        }  
    }
    return data;
}

/**
 * Thêm bạn bè
 */
exports.addFriend = async(data) =>{
    let user = await User.findById(data.id);
    user.friends.push(data.idFriend);
    user.save();
    return user;
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

