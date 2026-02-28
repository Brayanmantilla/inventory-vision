package com.inventory.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_records")
public class InventoryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;
    private LocalDateTime detectedAt;
    private String sessionId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public LocalDateTime getDetectedAt() { return detectedAt; }
    public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}