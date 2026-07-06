package com.sisvet.repository;

import com.sisvet.entity.Vacuna;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacunaRepository extends JpaRepository<Vacuna, Integer> {
    Page<Vacuna> findByEstadoTrue(Pageable pageable);
    boolean existsByNombre(String nombre);
}
