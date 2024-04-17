package net.kdigital.portservice.controller;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.PortinfoDTO;

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


	@GetMapping("/port")
	public String portInfo() {

		return "vesselSchedule";
	}
	
	private void crawlingAll() { //뉴스기사 전체 크롤링
		log.info("crawling server: {}", url);
		
		//Map<String, Object> error = new HashMap<>();	// 에러 담을 맵
		//Map<String, Object> result = new HashMap<>();	// 정상 데이터를 담을 맵
		
		
		try {
			result = restTemplate.getForObject(url+"/news", List.class);
			
			
		} catch (HttpClientErrorException | HttpServerErrorException e) {
		} 
		
		// result가 멤버변수로 선언되어서 반환할 필요x
	}

	// ============================================== 스케줄 크롤러 ==============================================
	//항구 정보
	@GetMapping("/port_info")
	@ResponseBody
	public List<Map<String, String>> port_info( // 출발항, 도착항 정보 받아오기
			@ModelAttribute PortinfoDTO portInfo
			) {
		
		log.info("항구 정보: {}", portInfo.toString());

		List<Map<String, String>> res= scheduleCrawler(portInfo); // 스케줄 크롤링 함수 호출
		

		log.info("===========결과 : {}", res);
		return res; // 정상반환
	}


	private List<Map<String,String>> scheduleCrawler(PortinfoDTO portInfo) { // 해상 스케줄 크롤링
		log.info("crawling server: {}", url);
		ResponseEntity<String> res = null;
		List<Map<String, String>> dataList = null;

		try {
			// 정보를 보낼 때는 postForEntity를 써야 함
			res = restTemplate.postForEntity(url+"/schedule", portInfo, String.class);
			
			log.info("res : {}",res);

			// res는 json문자열이라 jackson을 이용해서 파싱해줘야 함
			// ObjectMapper를 사용하여 JSON을 List<Map<String, String>>으로 변환
	        ObjectMapper objectMapper = new ObjectMapper();
	        try {
	            dataList = objectMapper.readValue(res.getBody(), List.class);
	            
	        } catch (Exception e) {
	            e.printStackTrace();
	            dataList = null;
	            return dataList;
	        }

		} catch (HttpClientErrorException | HttpServerErrorException e) {
		} 

		return dataList;
	}

}
