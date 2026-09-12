package com.clinicaalamillo.repository;

import com.clinicaalamillo.model.DentalService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DentalServiceRepository extends JpaRepository<DentalService, Long> {

    List<DentalService> findByActiveTrueOrderByIdAsc();
}
