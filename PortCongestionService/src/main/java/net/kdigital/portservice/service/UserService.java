package net.kdigital.portservice.service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.UserDTO;
import net.kdigital.portservice.entity.UserEntity;
import net.kdigital.portservice.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
	private final UserRepository userRepository;
	private final BCryptPasswordEncoder bCryptPasswordEncoder;
	
	/**
	 * 회원가입 처리 
	 * @param userDTO
	 * @return 회원가입 성공 여부 
	 */
	@Transactional
	public void joinProc(UserDTO userDTO) {
		log.info("회원가입 서비스 도착!");
//		
//		boolean isExistUser = userRepository.existsById(userDTO.getUserEmail());
//		log.info("{}", isExistUser);
//		if(isExistUser) return false;
//		
		userDTO.setUserPwd(bCryptPasswordEncoder.encode(userDTO.getUserPwd()));
		
		UserEntity entity = UserEntity.toEntity(userDTO);
		userRepository.save(entity);
		
//		return true;
	}

	public boolean valEmail(String inputMail) {
		Optional<UserEntity> entity = userRepository.findById(inputMail);
		if(entity.isEmpty()) return true;
		return false;
	}

	@Transactional
	public void subscribe(String userEmail) {
		Optional<UserEntity> entity = userRepository.findById(userEmail);
		entity.get().setUserRole("ROLE_PRO");
		
	}
}
