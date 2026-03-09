package com.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

  @Id
  @Column(name = "unique_key")
  private String uniqueKey;

  @Column(name = "created_date", nullable = false)
  private LocalDateTime createdDate;

  @Column(name = "closed_date")
  private LocalDateTime closedDate;

  @Column(name = "complaint_type", nullable = false)
  private String complaintType;

  @Column(nullable = false)
  private String borough;

  @Column(nullable = false)
  private String status;

  @Column private Double latitude;

  @Column private Double longitude;

  public Complaint() {
    //
  }

  public String getUniqueKey() {
    return uniqueKey;
  }

  public LocalDateTime getCreatedDate() {
    return createdDate;
  }

  public LocalDateTime getClosedDate() {
    return closedDate;
  }

  public String getComplaintType() {
    return complaintType;
  }

  public String getBorough() {
    return borough;
  }

  public String getStatus() {
    return status;
  }

  public Double getLatitude() {
    return latitude;
  }

  public Double getLongitude() {
    return longitude;
  }
}
