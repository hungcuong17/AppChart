const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    avatar: {
        type: String,
        default:'/upload/avatars/user.png'
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [emailValidator, 'incorrect mail format']
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        type: String,
    }],
    statusLogin:{
        type: String,
        enum:['on','off'],
        default:"off"
    },
    friends :[{
        type: Schema.Types.ObjectId,
        replies: this
    }],
}, {
    timestamps: true
});

function emailValidator(value) {
    return /^.+@.+\..+$/.test(value);
};

module.exports = User = mongoose.model("users", UserSchema);