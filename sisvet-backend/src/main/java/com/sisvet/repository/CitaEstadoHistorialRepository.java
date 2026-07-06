package com.sisvet.repository;

import com.sisvet.entity.CitaEstadoHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CitaEstadoHistorialRepository extends JpaRepository<CitaEstadoHistorial, Long> {
    List<CitaEstadoHistorial> findByCita_IdCitaOrderByFechaCambioDesc(Long idCita);
}
