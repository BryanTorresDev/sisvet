package com.sisvet.repository;

import com.sisvet.entity.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNumeroDocumento(String numeroDocumento);
    boolean existsByNumeroDocumento(String numeroDocumento);
    Page<Cliente> findByEstadoTrue(Pageable pageable);

    @Query("SELECT c FROM Cliente c WHERE c.estado = true AND (LOWER(c.nombres) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(c.apellidoPaterno) LIKE LOWER(CONCAT('%',:q,'%')) OR c.numeroDocumento LIKE CONCAT('%',:q,'%'))")
    Page<Cliente> buscar(@Param("q") String q, Pageable pageable);
}
