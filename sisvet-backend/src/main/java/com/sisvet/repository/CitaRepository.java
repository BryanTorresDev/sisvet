package com.sisvet.repository;

import com.sisvet.entity.Cita;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    Page<Cita> findByMascota_IdMascota(Long idMascota, Pageable pageable);
    Page<Cita> findByVeterinario_IdVeterinario(Long idVeterinario, Pageable pageable);

    @Query("SELECT c FROM Cita c WHERE c.veterinario.idVeterinario = :idVet AND c.fechaHora BETWEEN :inicio AND :fin")
    List<Cita> findByVeterinarioAndFecha(@Param("idVet") Long idVet, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("SELECT COUNT(c) FROM Cita c WHERE c.estadoCita.nombre = :estado")
    Long countByEstado(@Param("estado") String estado);
}
