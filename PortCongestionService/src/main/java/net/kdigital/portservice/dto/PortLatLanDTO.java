package net.kdigital.portservice.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.kdigital.portservice.entity.PortLatLanEntity;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class PortLatLanDTO {
	private String portCd;
	private String portNameKo;
	private String portNameEng;
	private double lat;
	private double lon;
	private double avgVslCnt;
	
	public static PortLatLanDTO toDTO(PortLatLanEntity portInfoEntity) {
		return PortLatLanDTO.builder()
				.portCd(portInfoEntity.getPortCd())
				.portNameKo(portInfoEntity.getPortNameKo())
				.portNameEng(portInfoEntity.getPortNameEng())
				.lat(portInfoEntity.getLat())
				.lon(portInfoEntity.getLon())
				.avgVslCnt(portInfoEntity.getAvgVslCnt())
				.build();
	}
}
/*
port_cd VARCHAR2(10) primary key
, port_name_ko VARCHAR2(100) not null
, port_name_eng VARCHAR2(100) not null
, lat NUMBER(10,7) not null
, lon NUMBER(10,7) not null
, avg_vsl_cnt NUMBER(5,2) not null
*/