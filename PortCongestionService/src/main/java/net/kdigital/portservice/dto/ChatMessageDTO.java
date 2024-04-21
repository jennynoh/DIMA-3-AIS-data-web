package net.kdigital.portservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {

	// 메세지 타입: 입장, 채팅
	public enum MessageType {
		ENTER, TALK
	}
	
	private MessageType messageType; // 메세지 타
	private Long chatRoomId; // 방 번
	private Long senderId; // 채팅 보낸 사람 
	private String message; // 메세지 
}
