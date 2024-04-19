//package net.kdigital.portservice.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.socket.config.annotation.EnableWebSocket;
//import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
//import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
//
//import lombok.RequiredArgsConstructor;
//
//@Configuration
//@EnableWebSocket
//@RequiredArgsConstructor
//public class WebSocketConfig implements WebSocketConfigurer {
//	
//	private final WebSocketHandler webSocketHandler;
//	
//	@Override
//	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//		// endpoint 설정: /api/v1/chat/{postId}
//		// ws://localhost:9999/ws/chat으로 요청이 들어오면 websocket 통신을 진행한다.
//		// setAllowedOrigins("*")는 모든 ip에서 접속 가능하도록 해
//		registry.addHandler(webSocketHandler, "/ws/chat").setAllowedOrigins("*");
//
//	}
//
//}
