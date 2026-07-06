package com.sisvet.service.impl;

import com.sisvet.dto.request.UsuarioRequestDTO;
import com.sisvet.dto.response.UsuarioResponseDTO;
import com.sisvet.entity.Rol;
import com.sisvet.entity.Usuario;
import com.sisvet.entity.UsuarioRol;
import com.sisvet.entity.UsuarioRolId;
import com.sisvet.exception.BusinessException;
import com.sisvet.exception.EntityNotFoundException;
import com.sisvet.repository.RolRepository;
import com.sisvet.repository.UsuarioRepository;
import com.sisvet.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioResponseDTO> listar(Pageable pageable) {
        return usuarioRepository.findAll(pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
    }

    @Override
    public UsuarioResponseDTO registrar(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("El nombre de usuario ya está registrado");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("El correo electrónico ya está registrado");
        }
        if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
            throw new BusinessException("La contraseña es obligatoria para el registro");
        }

        Usuario usuario = Usuario.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .estado(true)
                .fechaCreacion(LocalDateTime.now())
                .roles(new ArrayList<>())
                .build();

        Usuario guardado = usuarioRepository.save(usuario);

        // Assign roles
        List<UsuarioRol> userRoles = new ArrayList<>();
        for (String roleName : dto.getRoles()) {
            Rol rol = rolRepository.findByNombre(roleName.toUpperCase())
                    .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado: " + roleName));

            UsuarioRol ur = UsuarioRol.builder()
                    .id(new UsuarioRolId(guardado.getIdUsuario(), rol.getIdRol()))
                    .usuario(guardado)
                    .rol(rol)
                    .fechaAsignacion(LocalDateTime.now())
                    .build();
            userRoles.add(ur);
        }
        guardado.getRoles().addAll(userRoles);
        Usuario finalUser = usuarioRepository.save(guardado);

        return toResponse(finalUser);
    }

    @Override
    public UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));

        // Check unique fields
        usuarioRepository.findByUsername(dto.getUsername())
                .ifPresent(u -> {
                    if (!u.getIdUsuario().equals(id)) {
                        throw new BusinessException("El nombre de usuario ya está en uso");
                    }
                });

        usuarioRepository.findByEmail(dto.getEmail())
                .ifPresent(u -> {
                    if (!u.getIdUsuario().equals(id)) {
                        throw new BusinessException("El correo electrónico ya está en uso");
                    }
                });

        usuario.setUsername(dto.getUsername());
        usuario.setEmail(dto.getEmail());

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        // Clear existing roles first
        usuario.getRoles().clear();
        usuarioRepository.saveAndFlush(usuario);

        // Assign new roles
        List<UsuarioRol> userRoles = new ArrayList<>();
        for (String roleName : dto.getRoles()) {
            Rol rol = rolRepository.findByNombre(roleName.toUpperCase())
                    .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado: " + roleName));

            UsuarioRol ur = UsuarioRol.builder()
                    .id(new UsuarioRolId(usuario.getIdUsuario(), rol.getIdRol()))
                    .usuario(usuario)
                    .rol(rol)
                    .fechaAsignacion(LocalDateTime.now())
                    .build();
            userRoles.add(ur);
        }
        usuario.getRoles().addAll(userRoles);
        Usuario finalUser = usuarioRepository.save(usuario);

        return toResponse(finalUser);
    }

    @Override
    public void eliminar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
        usuario.setEstado(false);
        usuarioRepository.save(usuario);
    }

    @Override
    public void alternarEstado(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
        usuario.setEstado(!usuario.getEstado());
        usuarioRepository.save(usuario);
    }

    private UsuarioResponseDTO toResponse(Usuario u) {
        return UsuarioResponseDTO.builder()
                .idUsuario(u.getIdUsuario())
                .username(u.getUsername())
                .email(u.getEmail())
                .estado(u.getEstado())
                .fechaCreacion(u.getFechaCreacion())
                .ultimoLogin(u.getUltimoLogin())
                .roles(u.getRoles().stream()
                        .map(ur -> ur.getRol().getNombre())
                        .collect(Collectors.toList()))
                .build();
    }
}
