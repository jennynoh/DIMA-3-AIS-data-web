package net.kdigital.portservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MenuController {
	
	@GetMapping("/subscription")
	public String subscription() {
		return "subscription";
	}

}
