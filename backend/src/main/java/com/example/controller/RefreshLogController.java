package com.example.controller;

import com.example.dto.DataRefreshDto;
import com.example.entity.DataRefreshLog;
import com.example.entity.RefreshStatus;
import com.example.repository.DataRefreshLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/refreshlogs")
public class RefreshLogController {

  private final DataRefreshLogRepository dataRefreshLogRepository;

  public RefreshLogController(DataRefreshLogRepository dataRefreshLogRepository) {
    this.dataRefreshLogRepository = dataRefreshLogRepository;
  }

  @GetMapping("/latest")
  public ResponseEntity<DataRefreshDto> getLatest() {
    return dataRefreshLogRepository
        .findFirstByStatusOrderByRefreshCompletedAtDesc(RefreshStatus.SUCCESS)
        .map(this::toDto)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  private DataRefreshDto toDto(DataRefreshLog r) {
    return new DataRefreshDto(
        r.getRefreshStartedAt().toString(),
        r.getRefreshCompletedAt().toString(),
        r.getRecordsProcessed(),
        r.getStatus().name());
  }
}
