package com.sisvet.repository;

import com.sisvet.entity.Veterinario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface VeterinarioRepository extends JpaRepository<Veterinario, Long> {
    Optional<Veterinario> findByNumeroDocumento(String numeroDocumento);
    boolean existsByNumeroDocumento(String numeroDocumento);
    boolean existsByCorreo(String correo);
    Page<Veterinario> findByEstadoTrue(Pageable pageable);

    @Query("SELECT v FROM Veterinario v WHERE v.estado = true AND (LOWER(v.nombres) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(v.apellidoPaterno) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Veterinario> buscar(@Param("q") String q, Pageable pageable);
}
