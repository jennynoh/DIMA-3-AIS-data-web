package net.kdigital.portservice.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.LoginUserDetails;

@Controller
@Slf4j
public class MenuController {
	
//	@GetMapping("/portStatus")
//	public String portStatus(@AuthenticationPrincipal LoginUserDetails loginUser
//			, Model model) {
//		log.info("{}", loginUser);
//		if(loginUser != null)
//			model.addAttribute("userName", loginUser.getNickName());
//		return "/portinfo/portStatus";
//	}
	
	@GetMapping("/portStatus")
	public String portStatus(Model model) {
	    // 현재 사용자의 인증 객체를 가져옴
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    
	    if (authentication != null && authentication.getPrincipal() instanceof LoginUserDetails) {
	        // 로그인 사용자 정보 업데이트
	        LoginUserDetails loginUser = (LoginUserDetails) authentication.getPrincipal();
	        log.info("{}", loginUser);
	        
	        // 모델에 사용자 정보 추가
	        model.addAttribute("userName", loginUser.getNickName());
	    }
	    
	    return "/portinfo/portStatus";
	}
	
	@GetMapping("/subscription")
	public String subscription() {
		return "subscription";
	}
	
	
    // 날씨 api test
	@GetMapping("/weatherinfo")
	public String weather() {
		return "weather";
	}
	
	@GetMapping("/chat")
	public String chat() {
		return "portinfo/chatTest";
	}
	
	@GetMapping("/gptChatbot")
	public String gptChat() {
		return "/portinfo/gptChatbot";
	}

}
