package com.sisvet.service.impl;

import com.sisvet.dto.response.DashboardResponseDTO;
import com.sisvet.repository.*;
import com.sisvet.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final ClienteRepository clienteRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final CitaRepository citaRepository;
    private final PagoRepository pagoRepository;

    @Override
    public DashboardResponseDTO obtenerResumen() {
        return DashboardResponseDTO.builder()
                .totalClientes(clienteRepository.count())
                .totalMascotas(mascotaRepository.count())
                .totalVeterinarios(veterinarioRepository.count())
                .citasProgramadas(citaRepository.countByEstado("PROGRAMADA"))
                .citasAtendidas(citaRepository.countByEstado("ATENDIDA"))
                .citasCanceladas(citaRepository.countByEstado("CANCELADA"))
                .ingresosTotales(pagoRepository.sumTotalPagado())
                .build();
    }
}
