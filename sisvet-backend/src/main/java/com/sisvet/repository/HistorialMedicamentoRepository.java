package com.sisvet.repository;

import com.sisvet.entity.HistorialMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistorialMedicamentoRepository extends JpaRepository<HistorialMedicamento, Long> {
    List<HistorialMedicamento> findByHistorialClinico_IdHistorial(Long idHistorial);
}
