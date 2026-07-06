package com.sisvet.repository;

import com.sisvet.entity.Notificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    Page<Notificacion> findByUsuario_IdUsuario(Long idUsuario, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notificacion n WHERE n.usuario.idUsuario = :id AND n.leido = false")
    Long countNoLeidas(@Param("id") Long idUsuario);
}
