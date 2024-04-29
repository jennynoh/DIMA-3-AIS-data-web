package net.kdigital.portservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import net.kdigital.portservice.model.ChatCompletionRequest;
import net.kdigital.portservice.model.ChatCompletionResponse;

@RestController
public class GPTController {
	
	private final RestTemplate gptRestTemplate;

	@Autowired
    public GPTController(@Qualifier("customGptRestTemplate")RestTemplate gptRestTemplate) {
		super();
		this.gptRestTemplate = gptRestTemplate;
	}

	
	@PostMapping("/hitOpenaiApi")
	public String getOpenaiResponse(
			@RequestBody String prompt) {
		ChatCompletionRequest chatCompletionRequest = new ChatCompletionRequest("gpt-3.5-turbo", prompt);
		
		ChatCompletionResponse response = gptRestTemplate.postForObject("https://api.openai.com/v1/chat/completions"
				, chatCompletionRequest, ChatCompletionResponse.class);
		
		return response.getChoices().get(0).getMessage().getContent();
	}

}
