package com.example.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.entity.RefreshStatus;
import com.example.repository.DataRefreshLogRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RefreshLogController.class)
class RefreshLogControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private DataRefreshLogRepository dataRefreshLogRepository;

  @Test
  void getLatest_returnsDataWhenRefreshExists() throws Exception {
    when(dataRefreshLogRepository.findFirstByStatusOrderByRefreshCompletedAtDesc(
            RefreshStatus.SUCCESS))
        .thenReturn(Optional.of(TestFixtures.dataRefresh(1500, RefreshStatus.SUCCESS)));

    mockMvc
        .perform(get("/api/refreshlogs/latest"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.recordsProcessed").value(1500))
        .andExpect(jsonPath("$.status").value("SUCCESS"))
        .andExpect(jsonPath("$.refreshStartedAt").isNotEmpty())
        .andExpect(jsonPath("$.refreshCompletedAt").isNotEmpty());
  }

  @Test
  void getLatest_returns404WhenNoRefreshExists() throws Exception {
    when(dataRefreshLogRepository.findFirstByStatusOrderByRefreshCompletedAtDesc(
            RefreshStatus.SUCCESS))
        .thenReturn(Optional.empty());

    mockMvc.perform(get("/api/refreshlogs/latest")).andExpect(status().isNotFound());
  }

  @Test
  void getLatest_returns404WhenOnlyFailedExists() throws Exception {
    when(dataRefreshLogRepository.findFirstByStatusOrderByRefreshCompletedAtDesc(
            RefreshStatus.SUCCESS))
        .thenReturn(Optional.empty());

    mockMvc.perform(get("/api/refreshlogs/latest")).andExpect(status().isNotFound());
  }

  @Test
  void getLatest_returns404WhenOnlyInProgressExists() throws Exception {
    when(dataRefreshLogRepository.findFirstByStatusOrderByRefreshCompletedAtDesc(
            RefreshStatus.SUCCESS))
        .thenReturn(Optional.empty());

    mockMvc.perform(get("/api/refreshlogs/latest")).andExpect(status().isNotFound());
  }
}
