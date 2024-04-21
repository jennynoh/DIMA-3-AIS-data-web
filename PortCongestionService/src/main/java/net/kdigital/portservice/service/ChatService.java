package net.kdigital.portservice.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.ChatRoomDTO;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
	
	private final ObjectMapper mapper;
	private Map<String, ChatRoomDTO> chatRooms;
	
	@PostConstruct
	private void init() {
		chatRooms = new LinkedHashMap<>();
	}
	
	public List<ChatRoomDTO> findAllRoom() {
		return new ArrayList<>(chatRooms.values());
	}
	
	public ChatRoomDTO findRoomById(String roomId) {
		return chatRooms.get(roomId);
	}
	
	
}
