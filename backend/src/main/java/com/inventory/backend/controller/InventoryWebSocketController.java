package com.inventory.backend.controller;

import com.inventory.backend.model.InventoryRecord;
import com.inventory.backend.model.Product;
import com.inventory.backend.repository.InventoryRecordRepository;
import com.inventory.backend.repository.ProductRepository;
import com.inventory.backend.service.DetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;
import java.util.*;

@Controller
public class InventoryWebSocketController {

    @Autowired
    private DetectionService detectionService;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private InventoryRecordRepository recordRepo;

@MessageMapping("/detect")
@SendTo("/topic/detections")
public Map<String, Object> processFrame(@Payload String base64Frame) {
    try {
        System.out.println("Frame recibido, tamaño base64: " + base64Frame.length());
        byte[] frame = java.util.Base64.getDecoder().decode(base64Frame);
        System.out.println("Bytes decodificados: " + frame.length);
        
        Map<String, Object> response = detectionService.detect(frame);
        List<Map<String, Object>> detections = (List<Map<String, Object>>) response.get("detections");
        System.out.println("Detecciones: " + detections.size());

        Map<String, Integer> counts = new HashMap<>();
        for (Map<String, Object> d : detections) {
            String className = (String) d.get("class_name");
            counts.merge(className, 1, Integer::sum);
        }

        List<Map<String, Object>> savedRecords = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            Optional<Product> product = productRepo.findByName(entry.getKey());
            if (product.isPresent()) {
                InventoryRecord record = new InventoryRecord();
                record.setProduct(product.get());
                record.setQuantity(entry.getValue());
                record.setDetectedAt(LocalDateTime.now());
                InventoryRecord saved = recordRepo.save(record);

                Map<String, Object> recordMap = new HashMap<>();
                recordMap.put("id", saved.getId());
                recordMap.put("quantity", saved.getQuantity());
                recordMap.put("detectedAt", saved.getDetectedAt().toString());
                Map<String, Object> productMap = new HashMap<>();
                productMap.put("name", product.get().getName());
                productMap.put("sku", product.get().getSku());
                recordMap.put("product", productMap);
                savedRecords.add(recordMap);
            }
        }

        return Map.of("records", savedRecords, "detections", detections);
    } catch (Exception e) {
        System.out.println("Error: " + e.getMessage());
        e.printStackTrace();
        return Map.of("error", e.getMessage(), "detections", List.of(), "records", List.of());
    }
}
}