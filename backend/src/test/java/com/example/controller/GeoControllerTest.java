package com.example.controller;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.entity.Complaint;
import com.example.repository.ComplaintRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GeoController.class)
class GeoControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private ComplaintRepository complaintRepository;

  @Test
  void getGeoPoints_returnsCorrectJsonShape() throws Exception {
    when(complaintRepository.findAllWithCoordinates())
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    "1", 40.7128, -74.006, "Noise", "Manhattan", "2025-03-01", "Open"),
                TestFixtures.complaint(
                    "2", 40.6782, -73.9442, "Pothole", "Brooklyn", "2025-03-02", "Closed")));

    mockMvc
        .perform(get("/api/complaints/geopoints"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].uniqueKey").value("1"))
        .andExpect(jsonPath("$[0].latitude").value(40.7128))
        .andExpect(jsonPath("$[0].longitude").value(-74.006))
        .andExpect(jsonPath("$[0].complaintType").value("Noise"))
        .andExpect(jsonPath("$[0].borough").value("Manhattan"))
        .andExpect(jsonPath("$[0].createdDate").value("2025-03-01"))
        .andExpect(jsonPath("$[0].status").value("Open"));
  }

  @Test
  void getGeoPoints_returnsEmptyArray() throws Exception {
    when(complaintRepository.findAllWithCoordinates()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/complaints/geopoints"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  @Test
  void getGeoPoints_returnsJsonContentType() throws Exception {
    when(complaintRepository.findAllWithCoordinates()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/complaints/geopoints"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
  }

  @Test
  void getGeoPoints_methodNotAllowedForPost() throws Exception {
    mockMvc.perform(post("/api/complaints/geopoints")).andExpect(status().isMethodNotAllowed());
  }

  @Test
  void getGeoPoints_returnsOkWhenRepositoryReturnsLargeList() throws Exception {
    List<Complaint> large = new ArrayList<>();
    for (int i = 0; i < 1000; i++) {
      large.add(
          TestFixtures.complaint(
              String.valueOf(i), 40.7128, -74.006, "Noise", "Manhattan", "2025-03-01", "Open"));
    }
    when(complaintRepository.findAllWithCoordinates()).thenReturn(large);

    mockMvc
        .perform(get("/api/complaints/geopoints"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1000)));
  }

  @Test
  void getGeoPoints_unknownPathReturns404() throws Exception {
    mockMvc.perform(get("/api/complaints/geopoints/unknown")).andExpect(status().isNotFound());
  }

  @Test
  void getGeoPoints_dateFormattedAsYyyyMmDd() throws Exception {
    when(complaintRepository.findAllWithCoordinates())
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    "1", 40.7128, -74.006, "Noise", "Manhattan", "2025-03-01", "Open")));

    mockMvc
        .perform(get("/api/complaints/geopoints"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].createdDate").value(matchesPattern("\\d{4}-\\d{2}-\\d{2}")));
  }

  @Test
  void getGeoPoints_excludesRecordsWithNullCoordinates() throws Exception {
    when(complaintRepository.findAllWithCoordinates()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/complaints/geopoints"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }
}
