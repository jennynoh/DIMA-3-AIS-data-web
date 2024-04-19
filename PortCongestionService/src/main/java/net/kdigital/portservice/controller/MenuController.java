package net.kdigital.portservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MenuController {
	
	@GetMapping("/portStatus")
	public String portStatus() {
		return "/portinfo/portStatus";
	}
	
	@GetMapping("/subscription")
	public String subscription() {
		return "subscription";
	}
	
	@GetMapping("/vesselSchedule")
	public String vesselSchedule() {
		return null;
	}
	
	@GetMapping("/portSchedule")
	public String portSchedule() {
		return null;
	}
	
	
    // 날씨 api test
	@GetMapping("/weatherinfo")
	public String weather() {
		return "weather";
	}

}
