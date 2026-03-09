package com.example.repository;

import com.example.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, String> {

    @Query("SELECT c FROM Complaint c WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL")
    List<Complaint> findAllWithCoordinates();
}
