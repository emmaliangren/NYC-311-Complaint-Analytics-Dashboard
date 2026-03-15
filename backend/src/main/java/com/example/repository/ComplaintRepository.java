package com.example.repository;

import com.example.entity.Complaint;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComplaintRepository
    extends JpaRepository<Complaint, String>, JpaSpecificationExecutor<Complaint> {

  @Query("SELECT c FROM Complaint c WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL")
  List<Complaint> findAllWithCoordinates();

  @Query(
      """
      SELECT c FROM Complaint c
      WHERE c.latitude IS NOT NULL
        AND c.longitude IS NOT NULL
        AND (:borough IS NULL OR c.borough = :borough)
        AND (:complaintType IS NULL OR c.complaintType = :complaintType)
        AND (:status IS NULL OR c.status = :status)
        AND (:createdDateFrom IS NULL OR c.createdDate >= :createdDateFrom)
        AND (:createdDateToExclusive IS NULL OR c.createdDate < :createdDateToExclusive)
      """)
  List<Complaint> findAllWithCoordinatesFiltered(
      @Param("borough") String borough,
      @Param("complaintType") String complaintType,
      @Param("status") String status,
      @Param("createdDateFrom") LocalDateTime createdDateFrom,
      @Param("createdDateToExclusive") LocalDateTime createdDateToExclusive);

  @Query("SELECT DISTINCT c.complaintType FROM Complaint c ORDER BY c.complaintType")
  List<String> findDistinctComplaintTypes();

  @Query("SELECT DISTINCT c.borough FROM Complaint c ORDER BY c.borough")
  List<String> findDistinctBoroughs();

  @Query("SELECT DISTINCT c.status FROM Complaint c ORDER BY c.status")
  List<String> findDistinctStatuses();
}
