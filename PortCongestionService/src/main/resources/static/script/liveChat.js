document.addEventListener("DOMContentLoaded", function () {
    var socket = new SockJS('/ws');
    var stompClient = Stomp.over(socket);
    var portId = document.querySelector("#portId").value;

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/sub/channel/' + portId, function (message) {
            showMessage(JSON, parse(message.body).content);
        });
    });

    document.querySelector("#send-button").addEventListener('click', function () {
        var messageContent = document.querySelector('#message-field').value.trim();
        if (messageContent && stompClient) {
            // MessageDTO와 형식..
            var chatMessage = {
                sender: document.getElementById("user").value.trim()
                , channelId: document.getElementById("portId").value.trim()
                , type: 'CHAT'
                , data: messageContent
            };

            stompClient.send("/pub/sendMessage", {}, JSON.stringify(chatMessage));
            document.querySelector('#message-field').value = null;
        }
    });
});

function showMessage(message) {
    var messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    document.querySelector('.chat-message-window').appendChild(messageElement);
}