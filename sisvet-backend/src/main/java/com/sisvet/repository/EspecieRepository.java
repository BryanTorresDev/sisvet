package com.sisvet.repository;

import com.sisvet.entity.Especie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EspecieRepository extends JpaRepository<Especie, Integer> {
    List<Especie> findByEstadoTrue();
    boolean existsByNombre(String nombre);
}
