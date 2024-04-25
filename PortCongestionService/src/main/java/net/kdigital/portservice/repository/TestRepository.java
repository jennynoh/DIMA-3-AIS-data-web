package net.kdigital.portservice.repository;



import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import net.kdigital.portservice.dto.TestDTO;
import net.kdigital.portservice.entity.TestEntity;

public interface TestRepository extends JpaRepository<TestEntity, Long> {

	// 항구 선별

	List<TestEntity> findByPortCdAndAtaDtLessThanAndAtbDtGreaterThan(String portCd, LocalDateTime clickTimeDate, LocalDateTime clickTimeDate2);

	List<TestEntity> findByPortCdAndAtbDtLessThanAndAtdDtGreaterThan(String searchPort, LocalDateTime clickTimeDate, LocalDateTime clickTimeDate2);

	List<TestEntity> findByPortCdAndAtaDtLessThanEqualAndAtaDtGreaterThanEqual(String searchPort,
			LocalDateTime clickTimeDate, LocalDateTime before24clickTimeDate);

	List<TestEntity> findByPortCdAndAtdDtLessThanEqualAndAtdDtGreaterThanEqual(String searchPort,
			LocalDateTime clickTimeDate, LocalDateTime before24clickTimeDate);

	List<TestEntity> findByPortCd(String searchPort);

	List<TestEntity> findByPortCdAndShipType(String searchPort, String shipType);

	List<TestEntity> findByPortCdAndAtaDtLessThanAndAtaDtGreaterThanEqual(String searchPort, LocalDateTime clickTimeDay,
			LocalDateTime minusDays);
	


	
}
