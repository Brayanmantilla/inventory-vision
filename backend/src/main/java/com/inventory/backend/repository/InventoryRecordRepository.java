package com.inventory.backend.repository;

import com.inventory.backend.model.InventoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRecordRepository extends JpaRepository<InventoryRecord, Long> {
}