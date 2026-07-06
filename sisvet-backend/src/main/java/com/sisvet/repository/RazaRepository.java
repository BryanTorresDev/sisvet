package com.sisvet.repository;

import com.sisvet.entity.Raza;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RazaRepository extends JpaRepository<Raza, Integer> {
    List<Raza> findByEspecie_IdEspecieAndEstadoTrue(Integer idEspecie);
    Page<Raza> findByEstadoTrue(Pageable pageable);
}
