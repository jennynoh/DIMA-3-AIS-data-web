package net.kdigital.portservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.kdigital.portservice.entity.TestEntity;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class TestDTO {
	private Long seq;
	private String portCd;
	private String vslId;
	private LocalDateTime ataDt;
	private LocalDateTime atbDt;
	private LocalDateTime atdDt;
	private String shipType;
	
	public static TestDTO toDTO(TestEntity testEntity) {
		return TestDTO.builder()
				.seq(testEntity.getSeq())
				.portCd(testEntity.getPortCd())
				.vslId(testEntity.getVslId())
				.ataDt(testEntity.getAtaDt())
				.atbDt(testEntity.getAtbDt())
				.atdDt(testEntity.getAtdDt())
				.shipType(testEntity.getShipType())
				.build();
	}
}
