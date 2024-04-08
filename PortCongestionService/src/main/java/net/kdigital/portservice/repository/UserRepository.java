package net.kdigital.portservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import net.kdigital.portservice.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, String> {

}
