package net.kdigital.portservice.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.entity.PortLatLanEntity;
import net.kdigital.portservice.service.PortLatLanService;



@Slf4j
@Controller
@RequiredArgsConstructor
public class PortLatLanController {
	private final PortLatLanService portInfoService;
	
	@GetMapping("/fun/portLatLng")
	@ResponseBody
	public List<PortLatLanEntity> portInfo() {
		List<PortLatLanEntity> portLatLng = portInfoService.bringPortInfo();
		
		return portLatLng;
	}

}
