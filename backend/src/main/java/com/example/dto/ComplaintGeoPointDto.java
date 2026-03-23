package com.example.dto;

public record ComplaintGeoPointDto(
    String uniqueKey,
    Double latitude,
    Double longitude,
    String complaintType,
    String borough,
    String createdDate,
    String status,
    String agencyName) {
  // no-arg
}
