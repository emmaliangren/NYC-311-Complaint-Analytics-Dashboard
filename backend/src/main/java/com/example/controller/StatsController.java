package com.example.controller;

import com.example.dto.AgencyCountDto;
import com.example.dto.BoroughCountDto;
import com.example.dto.SummaryDto;
import com.example.repository.ComplaintRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

  private final ComplaintRepository complaintRepository;

  public StatsController(ComplaintRepository complaintRepository) {
    this.complaintRepository = complaintRepository;
  }

  @GetMapping("/summary")
  public SummaryDto getSummary() {
    long total = complaintRepository.countAllComplaints();

    List<BoroughCountDto> byBorough =
        complaintRepository.countComplaintsByBorough().stream()
            .map(r -> new BoroughCountDto((String) r[0], ((Number) r[1]).longValue()))
            .toList();

    List<AgencyCountDto> byAgency =
        complaintRepository.countComplaintsByAgency().stream()
            .map(r -> new AgencyCountDto((String) r[0], ((Number) r[1]).longValue()))
            .toList();

    return new SummaryDto(total, byBorough, byAgency);
  }
}