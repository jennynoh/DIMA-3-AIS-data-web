document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#send-button").addEventListener('click', function () {
        var prompt = document.querySelector('#message-field').value.trim();

        $.ajax({
            url: "/hitOpenaiApi"
            , type: "post"
            , data: { "prompt": prompt }
            , success: function (resp) {
                // gpt 응답 메세지 출력
                console.log(resp);
            }
            , error: function () {
                // 에러 메세지  출력
                console.log("에러");
            }
        });

    });
});

function showMessage(message) {
    var messageElement = document.createElement('div');
    let date = new Date(message.sendTime);

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    let sendTime = timeFormatter.format(date);

    // let userName = document.querySelector('#user').val();
    let userName = "홍길동";
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