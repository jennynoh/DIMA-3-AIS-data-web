package net.kdigital.portservice.controller;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	List<Map<String, String>> result = null;

	@Value("${news.crawling.server}")
	String url;

	@GetMapping("/marineNews")
	public String marineNews() {

		return "user/marineNews";
	}

	@GetMapping("/receive_data")
	@ResponseBody
	public List<Map<String, String>> receive_data(@RequestParam(value="curr", defaultValue="1") int curr ) { //전체를 크롤링
		log.info("crawling server: {}, {}", url, curr);
		
		List<Map<String, String>> list = new ArrayList<>();
		if(curr == 1) {
			crawlingAll();
			list = new ArrayList<>();
			for(int i=0; i<10; ++i) {
				list.add(result.get(i));
			}
		} else if(curr == 2) {
			list = new ArrayList<>();
			for(int i=10; i<20; ++i) {
				
				list.add(result.get(i));
			}
		}
		log.info("==========={}", list.get(0));
		return list; // 정상반환
	}

	private void crawlingAll() { //전체를 크롤링
		log.info("crawling server: {}", url);

		//Map<String, Object> error = new HashMap<>();	// 에러 담을 맵
		//Map<String, Object> result = new HashMap<>();	// 정상 데이터를 담을 맵


		try {
			result = restTemplate.getForObject(url, List.class);


		} catch (HttpClientErrorException | HttpServerErrorException e) {
		} 

		// result가 멤버변수로 선언되어서 반환할 필요x
	}

}
