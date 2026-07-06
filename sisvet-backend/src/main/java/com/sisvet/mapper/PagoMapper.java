package com.sisvet.mapper;

import com.sisvet.dto.response.PagoResponseDTO;
import com.sisvet.entity.Pago;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PagoMapper {

    @Mapping(target = "idCita", source = "cita.idCita")
    PagoResponseDTO toResponse(Pago entity);
}
