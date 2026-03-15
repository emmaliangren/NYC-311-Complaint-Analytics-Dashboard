package com.example.repository;

import com.example.entity.Complaint;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

public class ComplaintSpecification {

    public static Specification<Complaint> hasCoordinates() {
        return (root, query, cb) ->
            cb.and(
                cb.isNotNull(root.get("latitude")),
                cb.isNotNull(root.get("longitude"))
            );
    }

    public static Specification<Complaint> hasComplaintType(String complaintType) {
        return (root, query, cb) ->
            cb.equal(root.get("complaintType"), complaintType);
    }

    public static Specification<Complaint> hasBorough(String borough) {
        return (root, query, cb) ->
            cb.equal(root.get("borough"), borough);
    }

    public static Specification<Complaint> hasStatus(String status) {
        return (root, query, cb) ->
            cb.equal(root.get("status"), status);
    }

    public static Specification<Complaint> createdAfter(LocalDate date) {
        return (root, query, cb) ->
            cb.greaterThanOrEqualTo(root.get("createdDate"), date.atStartOfDay());
    }

    public static Specification<Complaint> createdBefore(LocalDate date) {
        return (root, query, cb) ->
            cb.lessThanOrEqualTo(root.get("createdDate"), date.plusDays(1).atStartOfDay());
    }
}