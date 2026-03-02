package com.inventory.backend.controller;

import com.inventory.backend.model.InventoryRecord;
import com.inventory.backend.model.Product;
import com.inventory.backend.repository.InventoryRecordRepository;
import com.inventory.backend.repository.ProductRepository;
import com.inventory.backend.service.DetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class DetectionController {

    @Autowired
    DetectionService detectionService;
    @Autowired
    ProductRepository productRepo;
    @Autowired
    InventoryRecordRepository recordRepo;
    @Autowired
    SimpMessagingTemplate messagingTemplate;

    @PostMapping("/detect-frame")
    public Map<String, Object> detectFrame(@RequestBody Map<String, String> body) {
        try {
            String base64 = body.get("image");
            System.out.println("Frame recibido! tamaño: " + base64.length());
            byte[] frame = Base64.getDecoder().decode(base64);

            Map<String, Object> response = detectionService.detect(frame);
            List<Map<String, Object>> detections = (List<Map<String, Object>>) response.get("detections");
            System.out.println("Detecciones: " + detections.size());

            Map<String, Integer> counts = new HashMap<>();
            for (Map<String, Object> d : detections) {
                counts.merge((String) d.get("class_name"), 1, Integer::sum);
            }

            List<Map<String, Object>> savedRecords = new ArrayList<>();
            for (Map.Entry<String, Integer> entry : counts.entrySet()) {
                String className = entry.getKey();

                // Buscar o crear el producto automáticamente
                Product product = productRepo.findByName(className).orElseGet(() -> {
                    Product newProduct = new Product();
                    newProduct.setName(className);
                    newProduct.setSku(className.toUpperCase().replace(" ", "-") + "-AUTO");
                    newProduct.setCategory("detected");
                    return productRepo.save(newProduct);
                });

                InventoryRecord record = new InventoryRecord();
                record.setProduct(product);
                record.setQuantity(entry.getValue());
                record.setDetectedAt(LocalDateTime.now());
                InventoryRecord saved = recordRepo.save(record);

                Map<String, Object> recordMap = new HashMap<>();
                recordMap.put("id", saved.getId());
                recordMap.put("quantity", saved.getQuantity());
                recordMap.put("detectedAt", saved.getDetectedAt().toString());
                recordMap.put("product", Map.of("name", product.getName(), "sku", product.getSku()));
                savedRecords.add(recordMap);
            }

            Map<String, Object> result = Map.of("records", savedRecords, "detections", detections);
            messagingTemplate.convertAndSend("/topic/detections", result);
            return result;

        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return Map.of("error", e.getMessage());
        }
    }

    @GetMapping("/inventory")
    public List<Map<String, Object>> getInventory() {
        List<InventoryRecord> records = recordRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (InventoryRecord r : records) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("quantity", r.getQuantity());
            map.put("detectedAt", r.getDetectedAt().toString());
            map.put("product", Map.of("name", r.getProduct().getName(), "sku", r.getProduct().getSku()));
            result.add(map);
        }
        return result;
    }

    @DeleteMapping("/inventory")
    public Map<String, Object> clearInventory() {
        recordRepo.deleteAll();
        return Map.of("message", "Inventario limpiado");
    }
}