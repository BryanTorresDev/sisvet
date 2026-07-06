package com.sisvet.repository;

import com.sisvet.entity.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Integer> {
    List<TipoDocumento> findByEstadoTrue();
}
