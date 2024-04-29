package net.kdigital.portservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class PortCongestionServiceApplication {
	
	@Value("${openai.key}")
	private String openaiApiKey;

	public static void main(String[] args) {
		SpringApplication.run(PortCongestionServiceApplication.class, args);
	}
	
	// adding rest template headers
	@Bean(name = "customGptRestTemplate")
	RestTemplate gptRestTemplate() {
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.getInterceptors().add(((request, body, execution)->{
			request.getHeaders().add("Authorization", "Bearer "+openaiApiKey);
			return execution.execute(request, body);
		}));
		
		return restTemplate;
	}

}
