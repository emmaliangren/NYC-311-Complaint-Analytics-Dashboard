package com.example.repository;

import com.example.entity.Complaint;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComplaintRepository
    extends JpaRepository<Complaint, String>, JpaSpecificationExecutor<Complaint> {

  @Query("SELECT DISTINCT c.complaintType FROM Complaint c ORDER BY c.complaintType")
  List<String> findDistinctComplaintTypes();

  @Query("SELECT DISTINCT c.borough FROM Complaint c ORDER BY c.borough")
  List<String> findDistinctBoroughs();

  @Query("SELECT DISTINCT c.status FROM Complaint c ORDER BY c.status")
  List<String> findDistinctStatuses();

  @Query("SELECT DISTINCT a.name FROM Complaint c JOIN c.agency a ORDER BY a.name")
  List<String> findDistinctAgencyNames();

  @Query(
      value =
          """
          SELECT DISTINCT agency, medianMinutes
          FROM (
              SELECT a.name AS agency,
                     MEDIAN(TIMESTAMPDIFF(MINUTE, c.created_date, c.closed_date))
                     OVER (PARTITION BY a.name) AS medianMinutes
              FROM complaints c
              JOIN agencies a ON c.agency_id = a.id
              WHERE c.closed_date IS NOT NULL
          ) sub
          """,
      nativeQuery = true)
  List<ResolutionTimeProjection> findMedianResolutionTimeByAgency();

  /**
   * @returns resolution time in minutes per agency for closed complaints, to be aggregated (median)
   *     in the service layer. Result rows: [agencyName (String), minutes (Double)]
   */
  @Query(
      value =
          """
          SELECT a.name, TIMESTAMPDIFF(MINUTE, c.created_date, c.closed_date)
          FROM complaints c
          JOIN agencies a ON c.agency_id = a.id
          WHERE c.closed_date IS NOT NULL
          ORDER BY a.name
          """,
      nativeQuery = true)
  List<Object[]> findResolutionMinutesByAgency();

  @Query(
      value =
          """
          SELECT a.name, TIMESTAMPDIFF(MINUTE, c.created_date, c.closed_date)
          FROM complaints c
          JOIN agencies a ON c.agency_id = a.id
          WHERE c.closed_date IS NOT NULL AND a.name = :agency
          """,
      nativeQuery = true)
  List<Object[]> findResolutionMinutesByAgencyName(@Param("agency") String agency);

  @Query("SELECT COUNT(c) FROM Complaint c")
  long countAllComplaints();

  @Query("SELECT c.borough, COUNT(c) FROM Complaint c GROUP BY c.borough ORDER BY c.borough")
  List<Object[]> countComplaintsByBorough();

  @Query("SELECT a.name, COUNT(c) FROM Complaint c JOIN c.agency a GROUP BY a.name ORDER BY a.name")
  List<Object[]> countComplaintsByAgency();
}