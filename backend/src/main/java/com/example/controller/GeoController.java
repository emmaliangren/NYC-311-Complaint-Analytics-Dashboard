package com.example.controller;

import com.example.dto.ComplaintGeoPointDto;
import com.example.dto.FilterOptionsDto;
import com.example.entity.Complaint;
import com.example.repository.ComplaintRepository;
import com.example.repository.ComplaintSpecification;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/complaints")
public class GeoController {

  private final ComplaintRepository complaintRepository;

  public GeoController(ComplaintRepository complaintRepository) {
    this.complaintRepository = complaintRepository;
  }

  @GetMapping("/geopoints")
  public List<ComplaintGeoPointDto> getGeoPoints(
    @RequestParam Optional<String> complaintType,
    @RequestParam Optional<String> borough,
    @RequestParam Optional<String> status,
    @RequestParam Optional<LocalDate> dateFrom,
    @RequestParam Optional<LocalDate> dateTo) {

    Specification<Complaint> spec = Specification.where(ComplaintSpecification.hasCoordinates());

    if (complaintType.isPresent()) {
        spec = spec.and(ComplaintSpecification.hasComplaintType(complaintType.get()));
    }
    if (borough.isPresent()) {
        spec = spec.and(ComplaintSpecification.hasBorough(borough.get()));
    }
    if (status.isPresent()) {
        spec = spec.and(ComplaintSpecification.hasStatus(status.get()));
    }
    if (dateFrom.isPresent()) {
        spec = spec.and(ComplaintSpecification.createdAfter(dateFrom.get()));
    }
    if (dateTo.isPresent()) {
        spec = spec.and(ComplaintSpecification.createdBefore(dateTo.get()));
    }

    return complaintRepository.findAll(spec).stream().map(this::toDto).toList();
  }

  @GetMapping("/filter-options")
  public FilterOptionsDto getFilterOptions() {
    return new FilterOptionsDto(
        complaintRepository.findDistinctComplaintTypes(),
        complaintRepository.findDistinctBoroughs(),
        complaintRepository.findDistinctStatuses());

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
