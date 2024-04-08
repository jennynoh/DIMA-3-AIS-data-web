package net.kdigital.portservice.handler;

import java.io.IOException;
import java.net.URLEncoder;


import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CustomFailureHandler extends SimpleUrlAuthenticationFailureHandler {
	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException, ServletException {
		log.info("로그인 실패: {}", exception.getClass());
		String errMessage = "";
		
		if(exception instanceof BadCredentialsException) {
			errMessage = exception.getMessage();
			errMessage += "\n아이디와 비밀번호를 확인하세요.";
		} else {
			errMessage = exception.getMessage();
			errMessage += "\n관리자에게 문의하세요.";
		}
		errMessage = URLEncoder.encode(errMessage, "UTF-8");
		
		setDefaultFailureUrl("/user/login?error=true&errMessage="+errMessage);
		
		super.onAuthenticationFailure(request, response, exception);
	}
}
