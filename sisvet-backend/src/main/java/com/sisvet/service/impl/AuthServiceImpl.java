package com.sisvet.service.impl;

import com.sisvet.dto.request.LoginRequestDTO;
import com.sisvet.dto.response.LoginResponseDTO;
import com.sisvet.entity.Usuario;
import com.sisvet.exception.BusinessException;
import com.sisvet.rabbitmq.AuditMessage;
import com.sisvet.rabbitmq.AuditProducer;
import com.sisvet.repository.UsuarioRepository;
import com.sisvet.security.JwtService;
import com.sisvet.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final AuditProducer auditProducer;

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException e) {
            auditProducer.publicar(AuditMessage.builder()
                    .usuario(request.getUsername())
                    .modulo("AUTH")
                    .accion("LOGIN")
                    .descripcion("Intento de login fallido")
                    .estado("FALLIDO")
                    .fechaEvento(LocalDateTime.now())
                    .build());
            throw new BusinessException("Credenciales inválidas");
        }

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        usuario.setUltimoLogin(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(usuario);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(request.getUsername())
                .modulo("AUTH")
                .accion("LOGIN")
                .descripcion("Login exitoso")
                .estado("EXITOSO")
                .fechaEvento(LocalDateTime.now())
                .build());

        return LoginResponseDTO.builder()
                .token(token)
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .roles(usuario.getRoles().stream()
                        .map(ur -> ur.getRol().getNombre())
                        .collect(Collectors.toList()))
                .build();
    }
}
