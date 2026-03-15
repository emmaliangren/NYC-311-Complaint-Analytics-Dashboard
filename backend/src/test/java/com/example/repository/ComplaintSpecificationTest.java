package com.example.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.entity.Complaint;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class ComplaintSpecificationTest {

    @Mock private Root<Complaint> root;
    @Mock private CriteriaQuery<?> query;
    @Mock private CriteriaBuilder cb;
    @Mock private Predicate predicate;
    @Mock private Path mockPath;

    private static final String TYPE_NOISE = "Noise";
    private static final String BOROUGH_MANHATTAN = "Manhattan";
    private static final String STATUS_OPEN = "Open";
    private static final LocalDate DATE_FROM = LocalDate.of(2025, 1, 1);
    private static final LocalDate DATE_TO = LocalDate.of(2025, 3, 1);

    @Test
    void hasCoordinates_returnsPredicate() {
        doReturn(mockPath).when(root).get("latitude");
        doReturn(mockPath).when(root).get("longitude");

        Specification<Complaint> spec = ComplaintSpecification.hasCoordinates();
        spec.toPredicate(root, query, cb);

        org.mockito.Mockito.verify(root).get("latitude");
        org.mockito.Mockito.verify(root).get("longitude");
    }

    @Test
    void hasComplaintType_returnsPredicate() {
        doReturn(mockPath).when(root).get("complaintType");

        Specification<Complaint> spec = ComplaintSpecification.hasComplaintType(TYPE_NOISE);
        spec.toPredicate(root, query, cb);
        
        org.mockito.Mockito.verify(root).get("complaintType");
    }

    @Test
    void hasBorough_returnsPredicate() {
        doReturn(mockPath).when(root).get("borough");

        Specification<Complaint> spec = ComplaintSpecification.hasBorough(BOROUGH_MANHATTAN);
        spec.toPredicate(root, query, cb);
        
        org.mockito.Mockito.verify(root).get("borough");
    }

    @Test
    void hasStatus_returnsPredicate() {
        doReturn(mockPath).when(root).get("status");

        Specification<Complaint> spec = ComplaintSpecification.hasStatus(STATUS_OPEN);
        spec.toPredicate(root, query, cb);
        
        org.mockito.Mockito.verify(root).get("status");
    }

    @Test
    void createdAfter_returnsPredicate() {
        when(cb.greaterThanOrEqualTo(any(), any(LocalDateTime.class))).thenReturn(predicate);
        doReturn(null).when(root).get("createdDate");

        Specification<Complaint> spec = ComplaintSpecification.createdAfter(DATE_FROM);
        assertThat(spec.toPredicate(root, query, cb)).isNotNull();
    }

    @Test
    void createdBefore_returnsPredicate() {
        when(cb.lessThanOrEqualTo(any(), any(LocalDateTime.class))).thenReturn(predicate);
        when(root.get("createdDate")).thenReturn(null);

        Specification<Complaint> spec = ComplaintSpecification.createdBefore(DATE_TO);
        assertThat(spec.toPredicate(root, query, cb)).isNotNull();
    }

    @Test
    void specifications_canBeCombinedWithAnd() {
        Specification<Complaint> spec = Specification
            .where(ComplaintSpecification.hasCoordinates())
            .and(ComplaintSpecification.hasComplaintType(TYPE_NOISE))
            .and(ComplaintSpecification.hasBorough(BOROUGH_MANHATTAN));
        assertThat(spec).isNotNull();
    }

    @Test
    void specifications_canBeCombinedMultipleFilters() {
        Specification<Complaint> spec = Specification
            .where(ComplaintSpecification.hasCoordinates())
            .and(ComplaintSpecification.hasStatus(STATUS_OPEN))
            .and(ComplaintSpecification.createdAfter(DATE_FROM))
            .and(ComplaintSpecification.createdBefore(DATE_TO));
        assertThat(spec).isNotNull();
    }
}