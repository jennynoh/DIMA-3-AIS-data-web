package net.kdigital.portservice.controller;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.TestDTO;
import net.kdigital.portservice.entity.PortLatLanEntity;
import net.kdigital.portservice.entity.TestEntity;
import net.kdigital.portservice.service.TestService;

@Slf4j
@Controller
@RequiredArgsConstructor
public class TestController {
	private final TestService testService;
	
	/**
	 * 작업중인 선박 리스트 반환
	 * @param searchPort
	 * @param clickTime
	 * @return
	 */
	@GetMapping("/fun/working")
	@ResponseBody
	public Map<String, Object> working(
			@RequestParam(name="searchPort") String searchPort
			,@RequestParam(name="clickTime") String clickTime
			,@RequestParam(name="before24clickTime") String before24clickTime
			){
		DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		LocalDateTime clickTimeDate = LocalDateTime.parse(clickTime, dateTimeFormatter);
		LocalDateTime before24clickTimeDate = LocalDateTime.parse(before24clickTime, dateTimeFormatter);
		LocalDateTime clickTimeDay = clickTimeDate.withHour(0).withMinute(0).withSecond(0); // 입력 시간의 년월일만 유지, 시분초는 0으로 변환

		
		// 대기선박 찾기
		List<TestEntity> waitingVessels = testService.selectWaiting(searchPort, clickTimeDate);
		// 작업선박 찾기
		List<TestEntity> workingVessels = testService.selectWorking(searchPort, clickTimeDate);
		// 항구 평균 수용량 찾기
		double portAvgCnt =  testService.findPort(searchPort);

		// 항구별 선박별 평균 대기시간
		Map<String, Object> shipAvgwaiting = testService.shipAvgwaiting(searchPort);
		// 일주일 간 항구의 대기시간 평균 구하기
		List<Map<String, Object>> sevenDays = testService.calcChart(searchPort, clickTimeDay);
		// 한달 간 항구의 대기시간 평균 구하기
		List<Map<String, Object>> fourWeeks = testService.calcMonChart(searchPort, clickTimeDay);
		
		// 작업효율과 평균작업시간 구하기
		Map<String, String> calcRoh = testService.calcRoh(searchPort, clickTimeDate, before24clickTimeDate);
		
		
		// 결과를 HashMap에 저장
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("portCD", searchPort);
        resultMap.put("workingVessels", workingVessels);
        resultMap.put("waitingVessels", waitingVessels);
        resultMap.put("portAvgCnt", portAvgCnt);
        resultMap.put("shipAvgwaiting", shipAvgwaiting);
        resultMap.put("sevenDays", sevenDays);
        resultMap.put("fourWeeks", fourWeeks);
        resultMap.put("calcRoh", calcRoh);

        
        // 결과를 JSON 응답으로 직렬화하여 반환
        return resultMap;
	}

}
