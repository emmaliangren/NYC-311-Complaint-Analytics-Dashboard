package com.example.repository;

import com.example.entity.Complaint;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ComplaintRepository
    extends JpaRepository<Complaint, String>, JpaSpecificationExecutor<Complaint> {

  @Query("SELECT DISTINCT c.complaintType FROM Complaint c ORDER BY c.complaintType")
  List<String> findDistinctComplaintTypes();

  @Query("SELECT DISTINCT c.borough FROM Complaint c ORDER BY c.borough")
  List<String> findDistinctBoroughs();

  @Query("SELECT DISTINCT c.status FROM Complaint c ORDER BY c.status")
  List<String> findDistinctStatuses();
}
