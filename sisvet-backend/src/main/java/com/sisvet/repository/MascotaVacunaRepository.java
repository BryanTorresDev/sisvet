package com.sisvet.repository;

import com.sisvet.entity.MascotaVacuna;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MascotaVacunaRepository extends JpaRepository<MascotaVacuna, Long> {
    Page<MascotaVacuna> findByMascota_IdMascota(Long idMascota, Pageable pageable);
}
