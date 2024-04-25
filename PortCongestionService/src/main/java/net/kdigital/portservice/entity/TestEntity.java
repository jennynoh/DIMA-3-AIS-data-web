package net.kdigital.portservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.kdigital.portservice.dto.TestDTO;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
@Entity
@Table(name="port_waiting_df_improve_plus")
public class TestEntity {
	
	@Id
	@Column(name = "seq")
	private Long seq;
	
	@Column(name = "port_cd")
	private String portCd;
	
	@Column(name = "VSL_ID")
	private String vslId;
	
	@Column(name = "ATA_DT")
	private LocalDateTime ataDt;
	
	@Column(name = "ATB_DT")
	private LocalDateTime atbDt;
	
	@Column(name = "ATD_DT")
	private LocalDateTime atdDt;
	
	@Column(name = "ship_type")
	private String shipType;
	
	public static TestEntity toEntity(TestDTO testDTO) {
		return TestEntity.builder()
				.seq(testDTO.getSeq())
				.portCd(testDTO.getPortCd())
				.vslId(testDTO.getVslId())
				.ataDt(testDTO.getAtaDt())
				.atbDt(testDTO.getAtbDt())
				.atdDt(testDTO.getAtdDt())
				.shipType(testDTO.getShipType())
				.build();
	}
}
