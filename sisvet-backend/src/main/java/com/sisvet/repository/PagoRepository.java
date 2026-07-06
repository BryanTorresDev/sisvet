package com.sisvet.repository;

import com.sisvet.entity.Pago;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    Page<Pago> findByCita_IdCita(Long idCita, Pageable pageable);
    boolean existsByCita_IdCita(Long idCita);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p WHERE p.estado = 'PAGADO'")
    BigDecimal sumTotalPagado();
}
