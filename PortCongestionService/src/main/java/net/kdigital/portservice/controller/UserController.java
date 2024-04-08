package net.kdigital.portservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;
import net.kdigital.portservice.dto.UserDTO;
import net.kdigital.portservice.service.UserService;

@Controller
@RequiredArgsConstructor
public class UserController {
	private final UserService userService;
	
	@GetMapping("/user/join")
	public String join() {
		return "user/join";
	}
	
	
	@PostMapping("/user/joinProc")
	public String joinProc(@ModelAttribute UserDTO userDTO) {
		userDTO.setUserRole("ROLE_USER");
		userDTO.setEnabled(true);
		
		userService.joinProc(userDTO);
		
		return "redirect:/";
	}
	
	
	@GetMapping("/user/login")
	public String login(
			@RequestParam(value="error", required=false) String error
			, @RequestParam(value="errMessage", required=false) String errMessage
			, Model model) {
		model.addAttribute("error", error);
		model.addAttribute("errMessage", errMessage);
		
		return "user/login";
		
	}
	

}
