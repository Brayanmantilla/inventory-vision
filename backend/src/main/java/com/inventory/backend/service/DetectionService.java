package com.inventory.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Service
public class DetectionService {

    private final WebClient webClient;

    public DetectionService(@Value("${detection.service.url}") String url) {
        this.webClient = WebClient.builder().baseUrl(url).build();
    }

    public Map<String, Object> detect(byte[] imageBytes) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() { return "frame.jpg"; }
        });

        return webClient.post()
                .uri("/detect")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}