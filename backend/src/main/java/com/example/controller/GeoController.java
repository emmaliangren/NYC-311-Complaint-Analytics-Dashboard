package com.example.controller;

import com.example.dto.ComplaintGeoPointDto;
import com.example.entity.Complaint;
import com.example.repository.ComplaintRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/complaints")
public class GeoController {

  private final ComplaintRepository complaintRepository;

  public GeoController(ComplaintRepository complaintRepository) {
    this.complaintRepository = complaintRepository;
  }

  @GetMapping("/geopoints")
  public List<ComplaintGeoPointDto> getGeoPoints() {
    return complaintRepository.findAllWithCoordinates().stream().map(this::toDto).toList();
  }

  private ComplaintGeoPointDto toDto(Complaint c) {
    return new ComplaintGeoPointDto(
        c.getUniqueKey(),
        c.getLatitude(),
        c.getLongitude(),
        c.getComplaintType(),
        c.getBorough(),
        c.getCreatedDate().toLocalDate().toString(),
        c.getStatus());
  }
}
