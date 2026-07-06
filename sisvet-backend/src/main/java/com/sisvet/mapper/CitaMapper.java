package com.sisvet.mapper;

import com.sisvet.dto.response.CitaResponseDTO;
import com.sisvet.entity.Cita;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CitaMapper {

    @Mapping(target = "idMascota", source = "mascota.idMascota")
    @Mapping(target = "nombreMascota", source = "mascota.nombre")
    @Mapping(target = "idVeterinario", source = "veterinario.idVeterinario")
    @Mapping(target = "nombreVeterinario", expression = "java(entity.getVeterinario().getNombres() + ' ' + entity.getVeterinario().getApellidoPaterno())")
    @Mapping(target = "idServicio", source = "servicio.idServicio")
    @Mapping(target = "nombreServicio", source = "servicio.nombre")
    @Mapping(target = "estadoCita", source = "estadoCita.nombre")
    CitaResponseDTO toResponse(Cita entity);
}
