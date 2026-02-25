package com.example.temp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TempController {

  record HealthResponse(String status) {
    public String getStatus() {
      return status;
    }
  }

  @GetMapping("/api/health")
  public ResponseEntity<HealthResponse> health() {
    return ResponseEntity.ok(new HealthResponse("ok"));
  }
}
