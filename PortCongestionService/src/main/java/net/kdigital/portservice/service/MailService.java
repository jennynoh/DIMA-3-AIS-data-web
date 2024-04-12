package net.kdigital.portservice.service;

import java.util.UUID;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MailService {

//	@Autowired
	private final JavaMailSender javaMailSender;
	
	public String sendValidationCode(String email) {
		SimpleMailMessage message = new SimpleMailMessage();
		 
		message.setSubject("[ValueLinkU] 회원가입 인증코드입니다."); // 메일 제목
		message.setTo(email);
		
		String key = this.createKey();
		message.setText("아래 인증코드를 입력하세요.\n"+key);
		
		javaMailSender.send(message);
		
		return key;
	
	}
	
	private String createKey() {
		UUID uuid = UUID.randomUUID();
		return uuid.toString().substring(0,7);
	}
	
}
