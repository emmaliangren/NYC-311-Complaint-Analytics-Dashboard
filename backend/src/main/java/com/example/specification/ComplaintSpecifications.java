package com.example.specification;

import com.example.entity.Complaint;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

public class ComplaintSpecifications {

  public static Specification<Complaint> hasCoordinates() {
    return (root, query, cb) ->
        cb.and(root.get("latitude").isNotNull(), root.get("longitude").isNotNull());
  }

  public static Specification<Complaint> hasComplaintType(String type) {
    return (root, query, cb) -> cb.equal(root.get("complaintType"), type);
  }

  public static Specification<Complaint> hasStatus(String status) {
    return (root, query, cb) -> cb.equal(root.get("status"), status);
  }

  public static Specification<Complaint> hasBorough(String borough) {
    return (root, query, cb) -> cb.equal(root.get("borough"), borough);
  }

  public static Specification<Complaint> createdAfter(LocalDate date) {
    return (root, query, cb) ->
        cb.greaterThanOrEqualTo(root.get("createdDate"), date.atStartOfDay());
  }

  public static Specification<Complaint> createdBefore(LocalDate date) {
    return (root, query, cb) ->
        cb.lessThan(root.get("createdDate"), date.plusDays(1).atStartOfDay());
  }
}
