package net.kdigital.portservice.controller;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class CrawlingController {
	private final RestTemplate restTemplate;
	
	@Value("${news.crawling.server}")
	String url;
	
	@GetMapping("/marineNews")
	public String marineNews() {
		
		return "user/marineNews";
	}
	
	@GetMapping("/receive_data")
	@ResponseBody
	public List<Map<String, String>> crawling() {
		log.info("crawling server: {}", url);
		
		//Map<String, Object> error = new HashMap<>();	// 에러 담을 맵
		//Map<String, Object> result = new HashMap<>();	// 정상 데이터를 담을 맵
		List<Map<String, String>> result = null;
		
		try {
			result = restTemplate.getForObject(url, List.class);
			log.info("{}", result);
			
			
		} catch (HttpClientErrorException | HttpServerErrorException e) {
		} 
		
		return result; // 정상반환
	}
}
