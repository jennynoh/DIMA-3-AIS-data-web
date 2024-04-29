// AI chatbot 토글버튼 클릭 시 내부 플래그 on, off 설정
// gpt on = 1, gpt off = 0
// document.addEventListener("DOMContentLoaded", function () {
let toggleOn = 0;
document.getElementById("toggle-slider").addEventListener('change', function () {
    console.log(toggleOn);
    if (toggleOn == 0) {
        console.log("GPT on!");
        showGPTChatWindow(); // gpt 채팅창 노출
        toggleOn = 1;
    } else {
        console.log("GPT off!");
        hideGPTChatWindow();
        toggleOn = 0;
    }
});
// })

// 
function showGPTChatWindow() {
    document.getElementsByClassName("gpt-chat-window")[0].style.display = 'block';
}

function hideGPTChatWindow() {
    document.getElementsByClassName("gpt-chat-window")[0].style.display = 'none';
}

// GPT 서버에 send request 
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#gpt-send-button").addEventListener('click', function () {
        var prompt = document.querySelector('#gpt-message-field').value.trim();

        // 내 질의 출력
        showMyMessage(prompt);

        $.ajax({
            url: "/hitOpenaiApi"
            , type: "post"
            , data: { "prompt": prompt }
            , success: function (resp) {
                // gpt 응답 메세지 출력
                console.log(resp);
                showGPTMessage(resp);
            }
            , error: function () {
                // 에러 메세지  출력
                console.log("에러");
            }
        });

    });
});

// 질의 출력 
function showMyMessage(prompt) {
    var messageElement = document.createElement('div');
    messageElement.innerHTML = `<div class="bubble-right">
                                    <div class="message-frame">
                                    <div class="message-sender">나</div>
                                        <div class="message-body">
                                            <div class="message-text">${prompt}</div>
                                        </div>
                                    </div>
                                </div>`;

    document.querySelector('.gpt-chat-message-window').appendChild(messageElement);

    // input field reset
    document.querySelector('#gpt-message-field').value = null;
}

// gpt 응답 출력
function showGPTMessage(resp) {
    var messageElement = document.createElement('div');
    messageElement.innerHTML = `<div class="bubble-left">
                                    <div class="message-frame">
                                        <div class="message-sender">AI Bot🤖</div>
                                        <div class="message-body">
                                            <div class="message-text">${resp}</div>
                                        </div>
                                    </div>
                                </div>`;
    messageElement.style.justifyContent = 'flex-start';
    document.querySelector('.gpt-chat-message-window').appendChild(messageElement);
}


/** input 창에 메세지 입력 시 **/
$("#gpt-message-field").on('keyup', function () {
    let text = $("#gpt-message-field").val();
    if (text.length != 0) {
        $("#gpt-img-change-to").attr('src', '/img/paper_airplane_white.svg');
        $("#gpt-send-button").prop('disabled', false);
    } else {
        $("#gpt-img-change-to").attr('src', '/img/paper_airplane_gray.svg');
        $("#gpt-send-button").prop('disabled', true);
    }
});