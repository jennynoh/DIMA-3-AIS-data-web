package net.kdigital.portservice.controller;

import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
	@GetMapping({"", "/"})
	public String index(
//			@AuthenticationPrincipal LoginUserDetails loginUser
//			, Model model
			) {
//		if(loginUser != null)
//			model.addAttribute("userId", loginUser.getUsername());
		return "index";
	}

}
