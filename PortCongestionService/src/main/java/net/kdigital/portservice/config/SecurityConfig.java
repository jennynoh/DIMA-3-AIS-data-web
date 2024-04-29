package net.kdigital.portservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;

import lombok.RequiredArgsConstructor;
import net.kdigital.portservice.handler.CustomFailureHandler;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class SecurityConfig {
	private final CustomFailureHandler failureHandler;

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests((auth) -> auth.requestMatchers("/", "/portStatus", "/portStatus/searchPort",
				"/user/login", "/user/join", "/user/joinNext", "/user/joinProc", "/marineNews", "/subscription", 
				"/port", "/port_info", "/receive_data", "/img/**", "/css/**", "/script/**", "/weatherinfo", 
				"/liveChatting", "/gptChatbot", "/chat", "/ws/**", "/ws",
				"/terminalSchedule", "/get_terminalSchedule", "/liveChatting", "/gptChatbot", "/fun/working", "/fun/portLatLng"
				, "/hitOpenaiApi").permitAll());

		http.formLogin((auth) -> auth.loginPage("/user/login")
				.usernameParameter("userEmail")
				.passwordParameter("userPwd")
				.loginProcessingUrl("/user/loginProc")
				.defaultSuccessUrl("/", true).permitAll()
				.failureHandler(failureHandler));

		http.logout((auth) -> auth.logoutUrl("/user/logout")
				.logoutSuccessUrl("/")
				.invalidateHttpSession(true)
				.deleteCookies("JSESSIONID"));

		http.csrf((auth) -> auth.disable());
		
//		http
//        .cors().and()
//        .authorizeRequests(authz -> authz
//            .antMatchers("/ws/**").permitAll()  // WebSocket 경로 허용
//            .anyRequest().authenticated()
//        )
//        .formLogin().and()
//        .httpBasic();

		return http.build();
	}

	@Bean
	BCryptPasswordEncoder bCryptPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}

}
