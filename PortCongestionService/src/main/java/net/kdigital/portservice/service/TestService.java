package net.kdigital.portservice.service;



import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.TestDTO;
import net.kdigital.portservice.entity.PortLatLanEntity;
import net.kdigital.portservice.entity.TestEntity;
import net.kdigital.portservice.repository.PortLatLanRepository;
import net.kdigital.portservice.repository.TestRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestService {
	
	private final TestRepository testRepository; 
	
	private final PortLatLanRepository portInfoRepository;

	/**
	 * 확인 당시 항구의 대기 중인 선박 리스트를 가져옴
	 * @param searchPort
	 * @return
	 */
	public List<TestEntity> selectWaiting(String searchPort, LocalDateTime clickTimeDate) { // import java.sql.Date;
		List<TestEntity> targetPort = null;

		
		// targetPort =  testRepository.findByPortCd(searchPort);
		targetPort = testRepository.findByPortCdAndAtaDtLessThanAndAtbDtGreaterThan(searchPort, clickTimeDate, clickTimeDate);
		
		
		List<TestDTO> dtoList = new ArrayList<>();
		
		targetPort.forEach((entity) -> dtoList.add(TestDTO.toDTO(entity)));
		
		return targetPort;
	}
	
	/**
	 * 확인 당시 항구의 작업중인 선박의 리스트 가져옴
	 * @param searchPort
	 * @param clickTimeDate
	 * @return
	 */
	public List<TestEntity> selectWorking(String searchPort, LocalDateTime clickTimeDate){
		List<TestEntity> targetPort = null;
		targetPort = testRepository.findByPortCdAndAtbDtLessThanAndAtdDtGreaterThan(searchPort, clickTimeDate, clickTimeDate);
	
		
		List<TestDTO> dtoList = new ArrayList<>();
		
		targetPort.forEach((entity) -> dtoList.add(TestDTO.toDTO(entity)));
		
		return targetPort;
	}

	/**
	 * 항구의 평균 수용량을 가져옴
	 * @param searchPort
	 * @return 
	 */
	public double findPort(String searchPort) {
		// 항구의 평균 수용량을 가져옴
		List<PortLatLanEntity> portAvgCnt = portInfoRepository.findByPortCd(searchPort);

		return portAvgCnt.get(0).getAvgVslCnt();
		
	}

	/**
	 * 특정 항구의 선박별 평균 대기시간 구하기
	 * @param searchPort
	 * @return
	 */
	public Map<String, Object> shipAvgwaiting(String searchPort) {
		List<TestEntity> portShipType = testRepository.findByPortCd(searchPort);
		
		Set<String> waitingTypeSet = new HashSet<>();
		
		for(TestEntity entity : portShipType) { //  항궁 데이터에서 선박 타입들을 중복없이 가져옴
			String ShipType = entity.getShipType();
			waitingTypeSet.add(ShipType);
		}
		
		// 해당 항구에 기록된 선박타입의 unique
		List<String> waitingTypeList = new ArrayList<>(waitingTypeSet);
		
		
		// 선박별 대기 시간을 저장(선박타입: 대기시간)
		Map<String, Object> shipAvgwaiting = new HashMap<>();
		
		for(String shipType :waitingTypeList) {
			List<TestEntity> portCdShipType = testRepository.findByPortCdAndShipType(searchPort, shipType);
			
			// waitingTime의 총합이 저장됨
			Duration totalWaitingTime = Duration.ZERO;
			
			for(int i=0; i < portCdShipType.size(); i++) {
				LocalDateTime atb = portCdShipType.get(i).getAtbDt();
				LocalDateTime ata = portCdShipType.get(i).getAtaDt();
				Duration waitingTime = Duration.between(ata, atb); // between에서 앞시간이 첫번째로 온다.
				
				totalWaitingTime = totalWaitingTime.plus(waitingTime);
			}
			
			Duration avgWaitingTime = totalWaitingTime.dividedBy(portCdShipType.size());
			
			
			if(avgWaitingTime == Duration.ZERO) { // 인천, 싱가포르의 대기시간이 0인 선박타입은 저장되지 못하게함
				continue;
			}
			
			
			// 전체를 초단위로 변환
			double totalSec = avgWaitingTime.getSeconds() + avgWaitingTime.getNano() / 1_000_000_000.0;
			
			// 초 단위를 소수점 첫째 자리에서 반올림합니다.
			totalSec  = Math.round(totalSec * 10.0) / 10.0;
			
			// 반올림된 초를 long으로 변환합니다.
			long roundTotalSec = Math.round(totalSec);
			
			// 일,시,분,초 단위로 분할
			long roundTotalSecToString  = roundTotalSec;
			long days = roundTotalSecToString / (24 * 3600);
			roundTotalSecToString %= (24 * 3600);
			long hours = roundTotalSecToString / 3600;
			roundTotalSecToString %= 3600;
			long minutes = roundTotalSecToString / 60;

			String formattedDuration;
			
			// 일, 시, 분, 초 단위로 분할한 결과를 문자열로 포맷팅합니다.
			if(days != 0) {
				formattedDuration = String.format(days +"일 "+ hours+"시간 " + minutes +"분");
			}
			else {
				formattedDuration = String.format(hours+"시간 " + minutes +"분");
			}

			
			List portAvg = new ArrayList<>();
			portAvg.add(formattedDuration);
			portAvg.add(roundTotalSec);
			
			// 키:선박타입, 값:리스트[평균대기시간(문자열), 평균대기시간(초)]
			shipAvgwaiting.put(shipType , portAvg);
			
		}


		
		return shipAvgwaiting;
	}
	/**
	 * 일주일 간 항구의 대기시간 평균 구하기
	 * @param searchPort
	 * @param clickTimeDay
	 * @return 
	 */
	public List<Map<String, Object>> calcChart(String searchPort, LocalDateTime clickTimeDay) {
		// 선박 수용량은 미리 구하기
		List<PortLatLanEntity> portAvgCntList = portInfoRepository.findByPortCd(searchPort);
		double portAvgCnt = portAvgCntList.get(0).getAvgVslCnt();
		
		List<Map<String, Object>> sevenDays = new ArrayList<>();

		for(int i= 7; i>0; --i) { // 확인일부터 지난 7일동안의 평균 대기시간과 작업효율을 구함
			LocalDateTime fristDay = clickTimeDay.minusDays(i-1);
			LocalDateTime secondDay = clickTimeDay.minusDays(i);
			
			/*
			 *  대기시간 평균 구하기
			 */
			// searchPort에서 fristDay 미만, secondDay이상인 ata를 가진 것들을 가져옴
			List<TestEntity> exam = testRepository.findByPortCdAndAtaDtLessThanAndAtaDtGreaterThanEqual(searchPort, fristDay, secondDay);

			// waitingTime의 총합이 저장됨
			Duration totalWaitingTime = Duration.ZERO;
						
			for(int j=0; j < exam.size(); j++) { // 하루동안 특정항구의 대기시간의 평균을 구함
				
				LocalDateTime atb = exam.get(j).getAtbDt();
				LocalDateTime ata = exam.get(j).getAtaDt();
				Duration waitingTime = Duration.between(ata, atb);
				totalWaitingTime = totalWaitingTime.plus(waitingTime);
			}
			Duration avgWaitingTime = totalWaitingTime.dividedBy(exam.size()); // 평균 대기시간(소수점 있음)
			
			/*
			 *  작업효율 구하기
			 */
			// 람다 구하기
			List<TestEntity> lambdaList = testRepository.findByPortCdAndAtaDtLessThanEqualAndAtaDtGreaterThanEqual(searchPort, fristDay, secondDay);
			double lambda = Math.round(lambdaList.size()/24.0 *100)/ 100.0; // 소수점 두자리 남기기
			
			
			// mu 구하기
			List<TestEntity> muList = testRepository.findByPortCdAndAtdDtLessThanEqualAndAtdDtGreaterThanEqual(searchPort, fristDay, secondDay);
			
			Duration totalWorkingTime = Duration.ZERO;
			
			for(int z=0; z < muList.size(); z++) { // 하루동안 특정항구의 작업시간의 평균을 구함
				
				LocalDateTime atd = muList.get(z).getAtdDt();
				LocalDateTime atb = muList.get(z).getAtbDt();
				Duration workingTime = Duration.between(atb, atd);
				totalWorkingTime = totalWorkingTime.plus(workingTime);
			}
			Duration avgWorkingTime = totalWorkingTime.dividedBy(muList.size()); // 평균 작업시간(소수점 있음)
			
			double totalSec = avgWorkingTime.getSeconds() + avgWorkingTime.getNano() / 1_000_000_000.0;
			
			// 초를 반올림한 후 long으로 변환합니다.
			long roundTotalSec = Math.round(totalSec);
			
			double mu_inverse = Math.round(avgWorkingTime.toMinutes()/60.0*100) / 100.0;
			
			double roh = Math.round(lambda * mu_inverse / portAvgCnt*100) / 100.0;

			// secondDay를 문자열로 변환
			String MonDay = String.format(secondDay.getMonthValue()+ "/"+ secondDay.getDayOfMonth());
			
			// 구해진 평균대기 시간을 문자열로 변환
			long roundTotalSecToString  = roundTotalSec;
			
			long days = roundTotalSecToString / (24 * 3600);
			roundTotalSecToString %= (24 * 3600);
			long hours = roundTotalSecToString / 3600;
			roundTotalSecToString %= 3600;
			long minutes = roundTotalSecToString / 60;

			String formattedDuration;
			// 일, 시, 분, 초 단위로 분할한 결과를 문자열로 포맷팅합니다.
			if(days != 0) {
				formattedDuration = String.format(days +"일 "+ hours+"시간 " + minutes +"분");
			}
			else {
				formattedDuration = String.format(hours+"시간 " + minutes +"분");
			}
			
			// 구해진 평균 대기시간과 작업효율을 저장
			Map<String, Object> calcChart = new HashMap<>();
			
			calcChart.put("date", MonDay);
			calcChart.put("avgWaitingTime", roundTotalSec);
			calcChart.put("roh", roh);
			calcChart.put("avgWaitingTimeString", formattedDuration);
			
			sevenDays.add(calcChart);
		}
		
		return sevenDays;
	}
	
	/**
	 * 4주 간 항구의 대기시간 평균 구하기
	 * @param searchPort
	 * @param clickTimeDay
	 * @return
	 */
	public List<Map<String, Object>> calcMonChart(String searchPort, LocalDateTime clickTimeDay) {
		List <PortLatLanEntity> portInfo = portInfoRepository.findByPortCd(searchPort);
		double avgVslCnt = portInfo.get(0).getAvgVslCnt(); 
		
		List<Map<String, Object>> fourWeeks = new ArrayList<>();
		
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd");
		
		
		// 주 변환
		for(int i= 3; i > -1; i--) {
			LocalDateTime weekStartDay = clickTimeDay.minusDays(1+(7*i));
			LocalDateTime weekEndDay = clickTimeDay.minusDays(7+(7*i));
			
			Map<String, Object> calcMonChart = new HashMap<>();
			
			List<Double> rohList = new ArrayList<>();
			
			long TOTOALSEC = 0;
			
			// 일변환
			for(int h= 7; h>0; --h) {
				LocalDateTime fristDay = weekStartDay.minusDays(h-1);
				LocalDateTime secondDay = weekStartDay.minusDays(h);
				
				/*
				 *  대기시간 평균 구하기
				 */
				List<TestEntity> exam = testRepository.findByPortCdAndAtaDtLessThanAndAtaDtGreaterThanEqual(searchPort, fristDay, secondDay);
				
				// waitingTime의 총합이 저장됨
				Duration totalWaitingTime = Duration.ZERO;
							
				for(int j=0; j < exam.size(); j++) { // 한 주동안 특정항구의 대기시간의 평균을 구함
					
					LocalDateTime atb = exam.get(j).getAtbDt();
					LocalDateTime ata = exam.get(j).getAtaDt();
					Duration waitingTime = Duration.between(ata, atb);
					totalWaitingTime = totalWaitingTime.plus(waitingTime);
				}
				Duration avgWaitingTime = totalWaitingTime.dividedBy(exam.size()); // 평균 대기시간(소수점 있음)
				
				/*
				 *  작업효율 구하기
				 */
				// 람다 구하기
				List<TestEntity> lambdaList = testRepository.findByPortCdAndAtaDtLessThanEqualAndAtaDtGreaterThanEqual(searchPort, fristDay, secondDay);
				double lambda = Math.round(lambdaList.size()/24.0 *100)/ 100.0; // 소수점 두자리 남기기
				
				
				// mu 구하기
				List<TestEntity> muList = testRepository.findByPortCdAndAtdDtLessThanEqualAndAtdDtGreaterThanEqual(searchPort, fristDay, secondDay);
				
				Duration totalWorkingTime = Duration.ZERO;
				
				for(int z=0; z < muList.size(); z++) { // 한주동안 특정항구의 작업시간의 평균을 구함
					
					LocalDateTime atd = muList.get(z).getAtdDt();
					LocalDateTime atb = muList.get(z).getAtbDt();
					Duration workingTime = Duration.between(atb, atd);
					totalWorkingTime = totalWorkingTime.plus(workingTime);
				}
				Duration avgWorkingTime = totalWorkingTime.dividedBy(muList.size()); // 평균 작업시간(소수점 있음)
				
				double totalSec = avgWorkingTime.getSeconds() + avgWorkingTime.getNano() / 1_000_000_000.0;
				
				// 초를 반올림한 후 long으로 변환합니다.
				long roundTotalSec = Math.round(totalSec);
				
				double mu_inverse = Math.round(avgWorkingTime.toMinutes()/60.0*100) / 100.0;
				
				double roh = Math.round(lambda * mu_inverse / avgVslCnt*100) / 100.0;
				
				rohList.add(roh);
				TOTOALSEC += roundTotalSec;
				
			} // 하루 단위: 혼잡도
			
			// 1주동안의 혼잡도 구하기
			double sum = 0.0;
			for (double num : rohList) {
			    sum += num;
			}
			double average = 0.0;
			average = Math.round((sum / 7.0)*100.0)/100.0;
			
			//
			long TOTALSECAVG = Math.round(TOTOALSEC / 7.0);
			
			// i를 몇번째 주인지 문자열로 변환
			String StartDay = weekStartDay.format(formatter);
			String EndDay = weekEndDay.format(formatter);
			String weeks = EndDay + " - " + StartDay;

			// 구해진 평균대기 시간을 문자열로 변환
			long roundTotalSecToString  = TOTALSECAVG;
			
			long days = roundTotalSecToString / (24 * 3600);
			roundTotalSecToString %= (24 * 3600);
			long hours = roundTotalSecToString / 3600;
			roundTotalSecToString %= 3600;
			long minutes = roundTotalSecToString / 60;

			String formattedDuration;

			// 일, 시, 분, 초 단위로 분할한 결과를 문자열로 포맷팅합니다.
			if(days != 0) {
				formattedDuration = String.format(days +"일 "+ hours+"시간 " + minutes +"분");
			}
			else {
				formattedDuration = String.format(hours+"시간 " + minutes +"분");
			}
			
			
			// 구해진 평균 대기시간과 작업효율을 저장
			
			calcMonChart.put("weeks", weeks);
			calcMonChart.put("avgWaitingTime", TOTALSECAVG);
			calcMonChart.put("roh", average);
			calcMonChart.put("avgWaitingTimeString", formattedDuration);
			
			fourWeeks.add(calcMonChart);
			
		}
		
		return fourWeeks;
	}
	
	/**
	 * 작업효율과 평균 작업 시간 구하기
	 * @param searchPort
	 * @param clickTimeDate
	 * @param before24clickTimeDate
	 * @return 
	 */
	public Map<String, String> calcRoh(String searchPort, LocalDateTime clickTimeDate, LocalDateTime before24clickTimeDate) {
		List<PortLatLanEntity> portAvgCntList = portInfoRepository.findByPortCd(searchPort);
		
		double portAvgCnt = portAvgCntList.get(0).getAvgVslCnt(); // 선박 수용량
		
		List<TestEntity> lambdaList = testRepository.findByPortCdAndAtaDtLessThanEqualAndAtaDtGreaterThanEqual(searchPort, clickTimeDate, before24clickTimeDate);
		List<TestEntity> muList = testRepository.findByPortCdAndAtdDtLessThanEqualAndAtdDtGreaterThanEqual(searchPort, clickTimeDate, before24clickTimeDate);
		
		// 람다 구하기(소수점 두자리 반올림)
		double lambda = Math.round(lambdaList.size()/24.0 *100)/ 100.0; 
		
		// mu 구하기(소수점 두자리 반올림)
		Duration totalWorkingTime = Duration.ZERO;
		
		for(int z=0; z < muList.size(); z++) { // 하루동안 특정항구의 작업시간의 평균을 구함
			
			LocalDateTime atd = muList.get(z).getAtdDt();
			LocalDateTime atb = muList.get(z).getAtbDt();
			Duration workingTime = Duration.between(atb, atd);
			totalWorkingTime = totalWorkingTime.plus(workingTime);
		}
		Duration avgWorkingTime = totalWorkingTime.dividedBy(muList.size()); // 평균 작업시간(소수점 있음)
		double mu_inverse = Math.round(avgWorkingTime.toMinutes()/60.0*100) / 100.0;
		
		// 작업 효율(소수점 두자리 반올림)
		double roh = Math.round(lambda * mu_inverse / portAvgCnt*100) / 100.0;
		
		// 전체를 초단위로 변환
		double totalSec = avgWorkingTime.getSeconds() + avgWorkingTime.getNano() / 1_000_000_000.0;
					
		// 초를 반올림한 후 long으로 변환합니다.
		long roundTotalSec = Math.round(totalSec);
				
		// 일,시,분,초 단위로 분할
		long days = roundTotalSec / (24 * 3600);
		roundTotalSec %= (24 * 3600);
		long hours = roundTotalSec / 3600;
		roundTotalSec %= 3600;
		long minutes = roundTotalSec / 60;
		

		String formattedDuration; // 시간을 문자열로
		
		// 일, 시, 분 단위로 분할한 결과를 문자열로 포맷팅합니다.
		if(days != 0) { 
			formattedDuration = String.format(days +"일 "+ hours+"시간 " + minutes +"분");
		}
		else { // days가 0이면 일은 제외
			formattedDuration = String.format(hours+"시간 " + minutes +"분");
		}
		
		
		Map<String, String> calcRoh = new HashMap<>();
		
		calcRoh.put("avgWorkingTime", formattedDuration);
		calcRoh.put("roh", Double.toString(roh));

		
		return calcRoh;
	}
	




}
