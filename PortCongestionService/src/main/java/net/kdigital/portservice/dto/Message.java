package net.kdigital.portservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 24.04.22.월 STOMP 프로토콜 수정버전 
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Message {
	private String type;
	private String sender;
	private String channelId;
	private Object data;
	private LocalDateTime sendTime;
	
	public void setSender(String sender) {
		this.sender = sender;
	}
	
	public void newConnect() {
		this.type = "new";
	}
	
	public void closeConnect() {
		this.type = "close";
	}

}
