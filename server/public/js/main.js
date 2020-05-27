const socket = io();


//socket.emit('online','5ec77e114f7baf321c091322');

// socket.emit('offline','5ec77e114f7baf321c091322');
function myFunctionJoinChat() {
    var data ={
        senderId: "5ec77e114f7baf321c091322",
        receiverId: "5ec77f5b3ab6861a985fb5be",
    }
    socket.emit('joinChat', data)
}
function myFunction() {
    var data = {
        senderId: "5ec77e114f7baf321c091322",
        receiverId: "5ec77f5b3ab6861a985fb5be",
        content: 'Hello World',
        time: '2020-05-27',
        type: 'text'
    }
    socket.emit('input_create_message', data)
}
function myFunctionJoinChat2() {
    var data ={
        senderId: "5ec77f5b3ab6861a985fb5be",
        receiverId: "5ec77e114f7baf321c091322",
    }
    socket.emit('joinChat', data)
}

function myFunction2() {
    var data = {
        senderId: "5ec77f5b3ab6861a985fb5be",
        receiverId: "5ec77e114f7baf321c091322",
        content: 'Hello World',
        time: '2020-05-27',
        type: 'text'
    }
    socket.emit('input_create_message', data)
}
socket.on('output_create_message', data=>{
    console.log("______",data);
});