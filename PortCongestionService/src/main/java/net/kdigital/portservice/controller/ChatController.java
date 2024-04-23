package net.kdigital.portservice.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.Message;

@Controller
@Slf4j
@RequiredArgsConstructor
public class ChatController {
	
	private final SimpMessageSendingOperations simpMessageSendingOperations;
	
   /*
        /sub/channel/12345    - 구독(channelId:12345)
        /pub/hello            - 메세지 발행 
    */
	
	@MessageMapping("/sendMessage")  // 클라이언트에서 /pub/sendMessage로 메세지를 발행한다.   
	public void message(Message message) {
		
		// /sub/channel/채널아이디에 구독중인 클라이언트에게 메세지 보냄
		simpMessageSendingOperations.convertAndSend("/sub/channel/" + message.getChannelId(), message);   
	}
}
