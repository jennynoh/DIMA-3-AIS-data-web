//package net.kdigital.portservice.handler;
//
//import java.io.IOException;
//import java.util.HashMap;
//import java.util.HashSet;
//import java.util.Map;
//import java.util.Set;
//
//import org.springframework.stereotype.Component;
//import org.springframework.web.socket.CloseStatus;
//import org.springframework.web.socket.TextMessage;
//import org.springframework.web.socket.WebSocketSession;
//import org.springframework.web.socket.handler.TextWebSocketHandler;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import net.kdigital.portservice.dto.ChatMessageDTO;
//
//@Slf4j
//@RequiredArgsConstructor
//@Component
//public class WebSocketHandler extends TextWebSocketHandler {
//
//	private final ObjectMapper mapper;
//	
//	// 현재 연결된 세션
//	private final Set<WebSocketSession> sessions = new HashSet<>();
//	
//	// chatRoomId: {session1, session2}
//	private final Map<Long, Set<WebSocketSession>> chatRoomSessionMap = new HashMap<>();
//	
//	// 소켓 연결 확
//	@Override
//	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
//		log.info("{} 연결됨", session.getId());
//		sessions.add(session);
//	}
//	
//	// 소켓 통신 시 메세지의 전송을 다루는 부분
//	@Override
//	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
//		String payload = message.getPayload();
//		log.info("payload {}", payload);
//		
//		// payload -> chatMessageDTO 변환
//		ChatMessageDTO chatMessageDTO = mapper.readValue(payload, ChatMessageDTO.class);
//		log.info("session {}", chatMessageDTO.toString());
//		
//		Long chatRoomId = chatMessageDTO.getChatRoomId();
//		// 메모리에 채팅방에 대한 세션 없으면 만들어줌 
//		if(!chatRoomSessionMap.containsKey(chatRoomId)) {
//			chatRoomSessionMap.put(chatRoomId, new HashSet<>());
//		}
//		Set<WebSocketSession> chatRoomSession = chatRoomSessionMap.get(chatRoomId);
//		
//		// message에 담긴 타입 확인
//		// 이 때 message에서 getType으로 가져온 내용이 
//		// ChatDTO의 열거형인 MessageType 안에 있는 ENTER 와 동일한 값이라면,
//		if(chatMessageDTO.getMessageType().equals(ChatMessageDTO.MessageType.ENTER)) {
//			// sessions에 넘어온 session을 담고,
//			chatRoomSession.add(session);
//		}
//		// ?????
//		if (chatRoomSession.size()>=3) {
//			removeClosedSession(chatRoomSession);
//		}
//		sendMessageToChatRoom(chatMessageDTO, chatRoomSession);
//		
//	}
//	
//	
//	// 소켓 종료 확인
//	@Override
//	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
//		log.info("{} 연결 끊김", session.getId());
//		sessions.remove(session);
//	}
//	
//	
//	// ===== 채팅 관련 메소드 =====
//	private void removeClosedSession(Set<WebSocketSession> chatRoomSession) {
//		chatRoomSession.removeIf(sess -> !sessions.contains(sess));
//	}
//	
//	private void sendMessageToChatRoom(ChatMessageDTO chatMessageDTO, Set<WebSocketSession> chatRoomSession) {
//		chatRoomSession.parallelStream().forEach(sess -> sendMessage(sess, chatMessageDTO));
//	}
//	
//	public <T> void sendMessage(WebSocketSession session, T message) {
//		try {
//			session.sendMessage(new TextMessage(mapper.writeValueAsString(message)));
//		} catch(IOException e) {
//			log.error(e.getMessage(), e);
//		}
//	}
//
//
//
//}
//
//
//
//
//
//
//
//
