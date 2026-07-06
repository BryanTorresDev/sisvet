package com.sisvet.repository;

import com.sisvet.entity.Servicio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<Servicio, Integer> {
    Page<Servicio> findByEstadoTrue(Pageable pageable);
    boolean existsByNombre(String nombre);
}
