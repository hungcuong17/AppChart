const socket = io();


// socket.emit('online','5ece9b3ac79668226c3dd2b9');

// socket.emit('offline','5ec77e114f7baf321c091322');
function myFunctionJoinChat() {
    socket.emit('online','5ece9b3ac79668226c3dd2b9');
}

function myFunctionJoinChat2() {
    socket.emit('online','5ece9b6a1560e01ae49281b7');
}

function myFunction() {
    var data = {
        senderId: "5ece9b3ac79668226c3dd2b9",
        chatID: "5ecea4836743cd2538c53807",
        content: 'Hello World',
        type: 'text'
    }
    socket.emit('input_create_message', data)
}


function myFunction2() {
    var data = {
        senderId: "5ece9b6a1560e01ae49281b7",
        chatID: "5ecea4836743cd2538c53807",
        content: 'Hello World1',
        type: 'text'
    }
    socket.emit('input_create_message', data)
}
socket.on('output_create_message', data=>{
    console.log("______",data);
});
socket.on('get_user_online', data=>{
    console.log(data);
})