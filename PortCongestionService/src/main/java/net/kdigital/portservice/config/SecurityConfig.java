package net.kdigital.portservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import lombok.RequiredArgsConstructor;
import net.kdigital.portservice.handler.CustomFailureHandler;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	private final CustomFailureHandler failureHandler;

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests((auth) -> auth.requestMatchers("/", "/portinfo", "/portinfo/searchPort",
				"/user/login", "/user/join", "/user/joinNext", "/user/joinProc", "/marineNews", "/receive_data", "/subscription" ,"/img/**", "/css/**", "/script/**", "/weatherinfo").permitAll());

		http.formLogin((auth) -> auth.loginPage("/user/login")
				.usernameParameter("userId")
				.passwordParameter("userPwd")
				.loginProcessingUrl("/user/loginProc")
				.defaultSuccessUrl("/").permitAll()
				.failureHandler(failureHandler));

		http.logout((auth) -> auth.logoutUrl("/user/logout")
				.logoutSuccessUrl("/")
				.invalidateHttpSession(true)
				.deleteCookies("JSESSIONID"));

		http.csrf((auth) -> auth.disable());

		return http.build();
	}

	@Bean
	BCryptPasswordEncoder bCryptPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}

}
