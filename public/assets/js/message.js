/* var mySound = new Audio("/public/assets/audio/noti.mp3");
mySound.load(); */

/**
 * Send Message event Handler
 */
$(".sendMessageButton").click((e) => {

    var message = $('.typing_box').val().trim();  
    var ChatID = $('.chatID').val().trim(); 

    console.log(message+'---------'+ChatID);
    /* if(!message || !ChatID){
        sendMessages(message,ChatID);
    } else {
        console.log("hello");
    } */

    sendMessages(message,ChatID);

});

$(document).keydown(function(event){
    var message = $('.typing_box').val().trim();  
    var ChatID = $('.chatID').val().trim(); 

    var session = JSON.parse($(".local_data").val());

    //Emit Typing event to the server
     var emitData = { user: session.name, message: "is typing" ,ChatID:ChatID, profile:session.pofile_pic}
     socket.emit("typing", emitData);

    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        if(!message =='' || !ChatID ==''){
            sendMessages(message,ChatID);

            /*-----Emit messese event to server------*/
            var msg_emitting_data = {message:message,ChatID:ChatID}
            socket.emit('message', msg_emitting_data);
        }
        return false;	
    }
});

$(document).keyup(function(event){
    var ChatID = $('.chatID').val().trim();

    setTimeout(function(){
        //Emit stop Typing event to the server
        socket.emit("stopTyping", ChatID);
     }, 2000); 
});

$(document).ready(function(){
    var ChatID = $('.chatID').val().trim(); 

    /*------Emit an Event when user join the chat-----------*/
    socket.emit("JoinChat", ChatID);

    /*------Listner of Typing Event emit by server---------*/
    socket.on('notifyTyping',data => {
        $(".typingDots").show();
        var typing_html = `<div class="conversation-list">
                            <div class="chat-avatar">
                                <img src="/assets/${data.profile}" alt="${data.user}">
                            </div>
                            <div class="user-chat-content">
                                <div class="ctext-wrap">
                                    <div class="ctext-wrap-content">
                                        <p class="mb-0">
                                            typing
                                            <span class="animate-typing">
                                                <span class="dot"></span>
                                                <span class="dot"></span>
                                                <span class="dot"></span>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div class="conversation-name">${data.user}</div>
                            </div>
                        </div>`

        $(".typingDots").html(typing_html);    
    });

    /*------Listner of Typing Event emit by server---------*/
    socket.on('notifyStopTyping',() => {
        $(".typingDots").hide();
        $(".typingDots").html();    
    });

    // Recieve from server messages 
    socket.on('message', (msg) => {
        //appendMessage(msg, 'incoming');

        console.log("message reciver event on client side::"+ msg.message);

        var outhtml = CreateMessageHtml(msg,'');

        var container = $(".chatContainer");
        DisplayMessage(outhtml,container);

       // scrollToBottom();
    });

});


/**
 * Send Message API
 */
function sendMessages(message,ChatID){

    if(message !=''){

        $.post("/message/send", { message: message,ChatID:ChatID}, results => {

            /*------Check if Message saved succssfully-----*/

            var outhtml = CreateMessageHtml(results,'right');

            var container = $(".chatContainer");
            DisplayMessage(outhtml,container);
            
            $('.typing_box').val('');
        });
    }
}

function CreateMessageHtml(response,msg_type) {

    //var timestamp = timeDifference(new Date(), new Date(response.createdAt)); 
    
        return `<li class="${msg_type}">
            <div class="conversation-list">
            
            <div class="user-chat-content">
                <div class="ctext-wrap">
                    <div class="ctext-wrap-content">
                        <p class="mb-0">${response.message}</p>
                           
                        <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span class="align-middle">10:02</span></p>
                    </div>
                </div>
            </div>
        </div>
    </li>`
}

function DisplayMessage(outhtml,container) {
    
    container.append(outhtml);
    scrollToBottom();
}

function scrollToBottom() {
    $(".chatContainer").scrollTop = $(".chatContainer").scrollHeight
}

/**
 * File upload in chat stream
 *
 */
$(".media_attachment").change(function() {
    //console.log("clicked");
    var file = this.files[0];

    var ChatID = $('.chatID').val().trim(); 

    const formData = new FormData();
    formData.append('media_attachment', file, file.name);
    formData.append('ChatID',ChatID);

    console.log(formData);
    //return false;

    $.ajax('/media_attachment', {
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success(response) {
            console.log(response);
        },
        error() {
            console.log('Upload error');
        },
    });

});


$(window).keydown(function(event){
    console.log(event.keyCode);
        socket.emit('bang'); 
});


$(document).ready(function(){
    var sound = new Audio('/public/audio/1.mp3');   

    socket.on('play', function () {
        sound.play();   
    });
});

