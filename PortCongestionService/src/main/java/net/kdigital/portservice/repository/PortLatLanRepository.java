package net.kdigital.portservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import net.kdigital.portservice.entity.PortLatLanEntity;

public interface PortLatLanRepository extends JpaRepository<PortLatLanEntity, String> {

	List<PortLatLanEntity> findByPortCd(String portCd);

}
