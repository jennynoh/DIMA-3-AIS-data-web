// document.addEventListener("DOMContentLoaded", function () {
/**
 * 웹소켓 연결 
 */
function connectWebSocket() {
    var socket = new SockJS('/ws');
    var stompClient = Stomp.over(socket);
    var portId = document.querySelector("#portId").value;

    // 웹소켓 연결 & channel(port) subscribe
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/sub/channel/' + portId, function (message) {
            const obj = JSON.parse(message.body);
            showMessage(obj);
            console.log(obj.data);
        });
    });

    // 메세지 보내기
    document.querySelector("#send-button").addEventListener('click', function () {
        var messageContent = document.querySelector('#message-field').value.trim();
        if (messageContent && stompClient) {
            // MessageDTO와 형식..
            var chatMessage = {
                // sec:authentication=name 받아오기!!!
                sender: document.getElementById("user").value.trim()
                , channelId: document.getElementById("portId").value.trim()
                , type: 'CHAT'
                , sendTime: new Date(Date.now())
                , data: messageContent
            };

            // 메세지 뿌리기 
            stompClient.send("/pub/channel", {}, JSON.stringify(chatMessage));
            document.querySelector('#message-field').value = null;
        }
    });

    // channelId unsubscribe
    // document.querySelector('.close_btn').addEventListener('click', function () {
    //     stompClient.unsubscribe(portId);
    //     console.log("unsubscribed from channel: " + portId);
    // });

    // disconnect WebSocket
    document.querySelector('.close_btn').addEventListener('click', function () {
        stompClient.disconnect();
    });
};

/**
 * 메세지창에 메세지 출력 
 * @param {} message 
 */
function showMessage(message) {
    var messageElement = document.createElement('div');
    let date = new Date(message.sendTime);

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    let sendTime = timeFormatter.format(date);

    // 유저이름
    let userName = document.querySelector('#user').value;
    console.log(userName)
    // let userName = "홍길동";
    // 내가 보낸 메세지이면..
    if (userName == message.sender) {
        // right bubble로 출력
        messageElement.innerHTML = `<div class="bubble-right">
                                    <div class="message-frame">
                                        <div class="message-sender">${message.sender}</div>
                                        <div class="message-body">
                                            <div class="message-text">${message.data}</div>
                                            <div class="time">${sendTime}</div>
                                        </div>
                                    </div>
                                </div>`;
    } else {
        // left bubble로 출력
        messageElement.innerHTML = `<div class="bubble-left">
                                    <div class="message-frame">
                                        <div class="message-sender">${message.sender}</div>
                                        <div class="message-body">
                                            <div class="message-text">${message.data}</div>
                                            <div class="time">${sendTime}</div>
                                        </div>
                                    </div>
                                </div>`;
        messageElement.style.justifyContent = 'flex-start';
    }

    document.querySelector('.chat-message-window').appendChild(messageElement);
    document.querySelector('#lastChat').value = date.toLocaleDateString();
}