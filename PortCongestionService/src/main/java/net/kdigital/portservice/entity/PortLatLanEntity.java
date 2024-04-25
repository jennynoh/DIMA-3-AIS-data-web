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
import net.kdigital.portservice.dto.PortLatLanDTO;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
@Entity
@Table(name="port_info")
public class PortLatLanEntity {
	
	@Id
	@Column(name="port_cd")
	private String portCd;
	
	@Column(name="port_name_ko")
	private String portNameKo;
	
	@Column(name="port_name_eng")
	private String portNameEng;
	
	@Column(name="lat")
	private double lat;
	
	@Column(name="lon")
	private double lon;
	
	@Column(name="avg_vsl_cnt")
	private double avgVslCnt;
	
	public static PortLatLanEntity toEntity(PortLatLanDTO portInfoDTO) {
		return PortLatLanEntity.builder()
				.portCd(portInfoDTO.getPortCd())
				.portNameKo(portInfoDTO.getPortNameKo())
				.portNameEng(portInfoDTO.getPortNameEng())
				.lat(portInfoDTO.getLat())
				.lon(portInfoDTO.getLon())
				.avgVslCnt(portInfoDTO.getAvgVslCnt())
				.build();
	}
	
}
