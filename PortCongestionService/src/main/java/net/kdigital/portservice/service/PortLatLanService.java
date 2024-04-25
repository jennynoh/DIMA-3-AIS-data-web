package net.kdigital.portservice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.entity.PortLatLanEntity;
import net.kdigital.portservice.repository.PortLatLanRepository;


@Slf4j
@Service
@RequiredArgsConstructor
public class PortLatLanService {
	private final PortLatLanRepository portInfoRepository;

	public List<PortLatLanEntity> bringPortInfo() {
		return portInfoRepository.findAll();
		
	}
}
