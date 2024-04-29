package net.kdigital.portservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    @Primary
    RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
//    @Bean(name = "customGptRestTemplate")
//    RestTemplate gptRestTemplate() {
//    	return new RestTemplate();
//    }
}