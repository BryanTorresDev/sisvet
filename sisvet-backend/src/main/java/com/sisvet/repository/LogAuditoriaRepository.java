package com.sisvet.repository;

import com.sisvet.entity.LogAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {
    Page<LogAuditoria> findByUsuario(String usuario, Pageable pageable);
    Page<LogAuditoria> findByModulo(String modulo, Pageable pageable);
}
