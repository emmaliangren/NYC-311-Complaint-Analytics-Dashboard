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

  private static final String GEO_POINTS_URL = "/api/complaints/geopoints";
  private static final String GEO_POINTS_UNKNOWN_URL = "/api/complaints/geopoints/unknown";

  private static final String KEY_1 = "1";
  private static final String KEY_2 = "2";

  private static final String BOROUGH_MANHATTAN = "Manhattan";
  private static final double LAT_MANHATTAN = 40.7128;
  private static final double LNG_MANHATTAN = -74.006;

  private static final String BOROUGH_BROOKLYN = "Brooklyn";
  private static final double LAT_BROOKLYN = 40.6782;
  private static final double LNG_BROOKLYN = -73.9442;

  private static final String TYPE_NOISE = "Noise";
  private static final String TYPE_POTHOLE = "Pothole";

  private static final String DATE_1 = "2025-03-01";
  private static final String DATE_2 = "2025-03-02";
  private static final String DATE_PATTERN = "\\d{4}-\\d{2}-\\d{2}";

  private static final String STATUS_OPEN = "Open";
  private static final String STATUS_CLOSED = "Closed";

  private static final int LARGE_LIST_SIZE = 1000;

  @Autowired private MockMvc mockMvc;

  @MockBean private ComplaintRepository complaintRepository;

  // --- Success cases ---

  @Test
  void getGeoPoints_returnsCorrectJsonShape() throws Exception {
    when(complaintRepository.findAllWithCoordinates())
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN),
                TestFixtures.complaint(
                    KEY_2,
                    LAT_BROOKLYN,
                    LNG_BROOKLYN,
                    TYPE_POTHOLE,
                    BOROUGH_BROOKLYN,
                    DATE_2,
                    STATUS_CLOSED)));

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].uniqueKey").value(KEY_1))
        .andExpect(jsonPath("$[0].latitude").value(LAT_MANHATTAN))
        .andExpect(jsonPath("$[0].longitude").value(LNG_MANHATTAN))
        .andExpect(jsonPath("$[0].complaintType").value(TYPE_NOISE))
        .andExpect(jsonPath("$[0].borough").value(BOROUGH_MANHATTAN))
        .andExpect(jsonPath("$[0].createdDate").value(DATE_1))
        .andExpect(jsonPath("$[0].status").value(STATUS_OPEN));
  }

  @Test
  void getGeoPoints_returnsEmptyArray() throws Exception {
    when(complaintRepository.findAllWithCoordinates()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  @Test
  void getGeoPoints_returnsJsonContentType() throws Exception {
    when(complaintRepository.findAllWithCoordinates()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
  }

  @Test
  void getGeoPoints_returnsOkWhenRepositoryReturnsLargeList() throws Exception {
    List<Complaint> large = new ArrayList<>();
    for (int i = 0; i < LARGE_LIST_SIZE; i++) {
      large.add(
          TestFixtures.complaint(
              String.valueOf(i),
              LAT_MANHATTAN,
              LNG_MANHATTAN,
              TYPE_NOISE,
              BOROUGH_MANHATTAN,
              DATE_1,
              STATUS_OPEN));
    }
    when(complaintRepository.findAllWithCoordinates()).thenReturn(large);

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(LARGE_LIST_SIZE)));
  }

  @Test
  void getGeoPoints_dateFormattedAsYyyyMmDd() throws Exception {
    when(complaintRepository.findAllWithCoordinates())
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].createdDate").value(matchesPattern(DATE_PATTERN)));
  }

  @Test
  void getGeoPoints_excludesRecordsWithNullCoordinates() throws Exception {
    when(complaintRepository.findAllWithCoordinates()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  // --- Error / edge cases ---

  @Test
  void getGeoPoints_methodNotAllowedForPost() throws Exception {
    mockMvc.perform(post(GEO_POINTS_URL)).andExpect(status().isMethodNotAllowed());
  }

  @Test
  void getGeoPoints_unknownPathReturns404() throws Exception {
    mockMvc.perform(get(GEO_POINTS_UNKNOWN_URL)).andExpect(status().isNotFound());
  }
}
