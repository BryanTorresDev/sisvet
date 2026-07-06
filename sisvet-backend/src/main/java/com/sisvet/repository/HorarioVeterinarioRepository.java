package com.sisvet.repository;

import com.sisvet.entity.HorarioVeterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HorarioVeterinarioRepository extends JpaRepository<HorarioVeterinario, Long> {
    List<HorarioVeterinario> findByVeterinario_IdVeterinarioAndEstadoTrue(Long idVeterinario);
}
