package com.sisvet.service;

import com.sisvet.feign.dto.ReniecResponseDTO;

public interface IntegracionService {
    ReniecResponseDTO consultarDni(String dni, String ipCliente);
}
