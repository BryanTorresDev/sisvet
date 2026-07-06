package com.sisvet.repository;

import com.sisvet.entity.Mascota;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    Page<Mascota> findByEstadoTrue(Pageable pageable);
    Page<Mascota> findByCliente_IdClienteAndEstadoTrue(Long idCliente, Pageable pageable);

    @Query("SELECT m FROM Mascota m WHERE m.estado = true AND LOWER(m.nombre) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<Mascota> buscar(@Param("q") String q, Pageable pageable);
}
