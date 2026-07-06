package com.sisvet.repository;

import com.sisvet.entity.ArchivoClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ArchivoClinicoRepository extends JpaRepository<ArchivoClinico, Long> {
    List<ArchivoClinico> findByHistorialClinico_IdHistorialAndEstadoTrue(Long idHistorial);
}
