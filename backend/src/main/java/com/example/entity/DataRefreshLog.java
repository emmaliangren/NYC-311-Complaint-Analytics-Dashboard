package com.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "data_refresh_log")
public class DataRefreshLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "refresh_started_at", nullable = false)
  private Instant refreshStartedAt;

  @Column(name = "refresh_completed_at")
  private Instant refreshCompletedAt;

  @Column(name = "records_processed")
  private Integer recordsProcessed;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RefreshStatus status;

  public DataRefreshLog() {
    //
  }

  public Integer getId() {
    return id;
  }

  public Instant getRefreshStartedAt() {
    return refreshStartedAt;
  }

  public Instant getRefreshCompletedAt() {
    return refreshCompletedAt;
  }

  public Integer getRecordsProcessed() {
    return recordsProcessed;
  }

  public RefreshStatus getStatus() {
    return status;
  }
}
