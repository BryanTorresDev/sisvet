package com.sisvet.mapper;

import com.sisvet.dto.response.MascotaVacunaResponseDTO;
import com.sisvet.entity.MascotaVacuna;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MascotaVacunaMapper {

    @Mapping(target = "idMascota", source = "mascota.idMascota")
    @Mapping(target = "nombreMascota", source = "mascota.nombre")
    @Mapping(target = "nombreVacuna", source = "vacuna.nombre")
    @Mapping(target = "nombreVeterinario", expression = "java(entity.getVeterinario().getNombres() + ' ' + entity.getVeterinario().getApellidoPaterno())")
    MascotaVacunaResponseDTO toResponse(MascotaVacuna entity);
}
