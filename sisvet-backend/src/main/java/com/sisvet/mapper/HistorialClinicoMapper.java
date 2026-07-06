package com.sisvet.mapper;

import com.sisvet.dto.response.HistorialClinicoResponseDTO;
import com.sisvet.entity.HistorialClinico;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface HistorialClinicoMapper {

    @Mapping(target = "idMascota", source = "mascota.idMascota")
    @Mapping(target = "nombreMascota", source = "mascota.nombre")
    @Mapping(target = "idVeterinario", source = "veterinario.idVeterinario")
    @Mapping(target = "nombreVeterinario", expression = "java(entity.getVeterinario().getNombres() + ' ' + entity.getVeterinario().getApellidoPaterno())")
    @Mapping(target = "idCita", source = "cita.idCita")
    HistorialClinicoResponseDTO toResponse(HistorialClinico entity);
}
