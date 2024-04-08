package net.kdigital.portservice.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
	public boolean joinProc(UserDTO userDTO) {
		boolean isExistUser = userRepository.existsById(userDTO.getUserEmail());
		if(isExistUser) return false;
		
		userDTO.setUserPwd(bCryptPasswordEncoder.encode(userDTO.getUserPwd()));
		
		UserEntity entity = UserEntity.toEntity(userDTO);
		userRepository.save(entity);
		
		return true;
	}
}
