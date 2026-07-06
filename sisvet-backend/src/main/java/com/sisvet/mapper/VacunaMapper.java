package com.sisvet.mapper;

import com.sisvet.dto.response.VacunaResponseDTO;
import com.sisvet.entity.Vacuna;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface VacunaMapper {
    VacunaResponseDTO toResponse(Vacuna entity);
}
