package net.kdigital.portservice.controller;

import java.time.LocalDateTime;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.UserDTO;
import net.kdigital.portservice.service.MailService;
import net.kdigital.portservice.service.UserService;

@Controller
@RequiredArgsConstructor
@Slf4j
public class UserController {
	private final UserService userService;
	private final MailService mailService;

	// 회원가입 첫번째 화면 요청 
	@GetMapping("/user/join")
	public String join() {
		return "/user/join";
	}
	
	@GetMapping("/user/valEmail")
	@ResponseBody 
	public boolean valEmail(
			@RequestParam(name="inputMail") String inputMail) {
		return userService.valEmail(inputMail);
	}
	
	// 회원가입 두번째 화면 요청 
	@PostMapping("/user/joinNext")
	public String joinNext(
			@RequestParam(name="nickName") String nickName
			, @RequestParam(name="userEmail") String userEmail
			, @RequestParam(name="company") String company
			, @RequestParam(name="userPhone") String userPhone
			, Model model) {
		
		String key = mailService.sendValidationCode(userEmail);
		
		model.addAttribute("nickName", nickName);
		model.addAttribute("userEmail", userEmail);
		model.addAttribute("company", company);
		model.addAttribute("userPhone", userPhone);
		// join2.html에서 key와 입력 코드 일치 여부 확인 => enable register button 
		model.addAttribute("key", key);
		
		return "/user/joinNext";
		
	}

	@PostMapping("/user/joinProc")
	public String joinProc(@ModelAttribute UserDTO userDTO) {
		userDTO.setJoinDate(LocalDateTime.now());
		userDTO.setUserRole("ROLE_USER");
		userDTO.setNotificationSetting(true);
		userDTO.setEnabled(true);
		log.info(userDTO.toString());

		userService.joinProc(userDTO);

		return "redirect:/";
	}

	@GetMapping("/user/login")
	public String login(
			@RequestParam(value = "error", required = false) String error,
			@RequestParam(value = "errMessage", required = false) String errMessage, Model model) {
		model.addAttribute("error", error);
		model.addAttribute("errMessage", errMessage);

		return "user/login";

	}
	
	@PostMapping("/subscriptionProc")
	public String subscriptionProc(
			@RequestParam(name="userEmail") String userEmail) {
		userService.subscribe(userEmail);
		log.info("구독 요청!!"+userEmail);
		return "redirect:/";
	}
}
