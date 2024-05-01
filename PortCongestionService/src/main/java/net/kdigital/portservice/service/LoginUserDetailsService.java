package net.kdigital.portservice.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.kdigital.portservice.dto.LoginUserDetails;
import net.kdigital.portservice.dto.UserDTO;
import net.kdigital.portservice.entity.UserEntity;
import net.kdigital.portservice.repository.UserRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class LoginUserDetailsService implements UserDetailsService {
	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserEntity userEntity = userRepository.findById(username)
				.orElseThrow(() -> {
					throw new UsernameNotFoundException("error 발생");
				});
		
		UserDTO userDTO = UserDTO.toDTO(userEntity);
		log.info("{}", userDTO);
		
		// userRole을 authority로 반환하는 코드 추가 
		SimpleGrantedAuthority authority = new SimpleGrantedAuthority(userEntity.getUserRole());
		List<SimpleGrantedAuthority> authorities = Collections.singletonList(authority);
		log.info("{}", authorities.get(0));

        return new LoginUserDetails(userDTO);
	}

}
