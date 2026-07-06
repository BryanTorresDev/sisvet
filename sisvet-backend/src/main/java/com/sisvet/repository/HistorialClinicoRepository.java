package com.sisvet.repository;

import com.sisvet.entity.HistorialClinico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistorialClinicoRepository extends JpaRepository<HistorialClinico, Long> {
    Page<HistorialClinico> findByMascota_IdMascotaAndEstadoTrue(Long idMascota, Pageable pageable);
    Page<HistorialClinico> findByVeterinario_IdVeterinarioAndEstadoTrue(Long idVet, Pageable pageable);
}
