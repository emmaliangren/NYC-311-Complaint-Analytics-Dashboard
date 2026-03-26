package com.example.specification;

import com.example.entity.Complaint;
import jakarta.persistence.criteria.JoinType;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

public class ComplaintSpecification {

  private static Specification<Complaint> hasFieldEqualTo(String fieldName, Object value) {
    return (root, query, cb) -> cb.equal(root.get(fieldName), value);
  }

  public static Specification<Complaint> hasCoordinates() {
    return (root, query, cb) ->
        cb.and(cb.isNotNull(root.get("latitude")), cb.isNotNull(root.get("longitude")));
  }

  public static Specification<Complaint> hasComplaintType(String complaintType) {
    return hasFieldEqualTo("complaintType", complaintType);
  }

  public static Specification<Complaint> hasBorough(String borough) {
    return hasFieldEqualTo("borough", borough);
  }

  public static Specification<Complaint> hasStatus(String status) {
    return hasFieldEqualTo("status", status);
  }

  public static Specification<Complaint> createdAfter(LocalDate date) {
    return (root, query, cb) ->
        cb.greaterThanOrEqualTo(root.get("createdDate"), date.atStartOfDay());
  }

  public static Specification<Complaint> createdBefore(LocalDate date) {
    return (root, query, cb) ->
        cb.lessThan(root.get("createdDate"), date.plusDays(1).atStartOfDay());
  }

  public static Specification<Complaint> hasAgencyName(String agencyName) {
    return (root, query, cb) ->
        cb.equal(root.join("agency", JoinType.INNER).get("name"), agencyName);
  }
}
