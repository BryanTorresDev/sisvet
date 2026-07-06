package com.sisvet.repository;

import com.sisvet.entity.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EspecialidadRepository extends JpaRepository<Especialidad, Integer> {
    List<Especialidad> findByEstadoTrue();
    boolean existsByNombre(String nombre);
}
