package com.sisvet.mapper;

import com.sisvet.dto.response.ClienteResponseDTO;
import com.sisvet.entity.Cliente;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ClienteMapper {

    @Mapping(target = "tipoDocumento", source = "tipoDocumento.nombre")
    @Mapping(target = "nombreCompleto", expression = "java(entity.getNombres() + ' ' + entity.getApellidoPaterno() + ' ' + entity.getApellidoMaterno())")
    ClienteResponseDTO toResponse(Cliente entity);
}
