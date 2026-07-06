package com.sisvet.mapper;

import com.sisvet.dto.response.VeterinarioResponseDTO;
import com.sisvet.entity.Veterinario;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface VeterinarioMapper {

    @Mapping(target = "especialidad", source = "especialidad.nombre")
    @Mapping(target = "tipoDocumento", source = "tipoDocumento.nombre")
    @Mapping(target = "nombreCompleto", expression = "java(entity.getNombres() + ' ' + entity.getApellidoPaterno() + ' ' + entity.getApellidoMaterno())")
    VeterinarioResponseDTO toResponse(Veterinario entity);
}
