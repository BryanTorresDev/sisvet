package com.sisvet.mapper;

import com.sisvet.dto.response.MascotaResponseDTO;
import com.sisvet.entity.Mascota;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MascotaMapper {

    @Mapping(target = "idCliente", source = "cliente.idCliente")
    @Mapping(target = "nombreCliente", expression = "java(entity.getCliente().getNombres() + ' ' + entity.getCliente().getApellidoPaterno())")
    @Mapping(target = "idRaza", source = "raza.idRaza")
    @Mapping(target = "nombreRaza", source = "raza.nombre")
    @Mapping(target = "nombreEspecie", source = "raza.especie.nombre")
    MascotaResponseDTO toResponse(Mascota entity);
}
