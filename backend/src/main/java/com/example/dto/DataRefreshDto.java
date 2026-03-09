package com.example.dto;

public record DataRefreshDto(
    String refreshStartedAt, String refreshCompletedAt, int recordsProcessed, String status) {
  // no-arg
}
