package com.sisvet.repository;

import com.sisvet.entity.Medicamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Integer> {
    Page<Medicamento> findByEstadoTrue(Pageable pageable);
    boolean existsByNombre(String nombre);
}
