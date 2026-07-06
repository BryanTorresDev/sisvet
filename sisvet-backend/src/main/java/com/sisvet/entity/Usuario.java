package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "usuario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario") private Long idUsuario;
    @Column(name = "username", nullable = false, unique = true, length = 50) private String username;
    @Column(name = "password", nullable = false, length = 255) private String password;
    @Column(name = "email", nullable = false, unique = true, length = 150) private String email;
    @Builder.Default
    @Column(name = "estado", nullable = false) private Boolean estado = true;
    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion = LocalDateTime.now();
    @Column(name = "ultimo_login") private LocalDateTime ultimoLogin;

    @Builder.Default
    @OneToMany(mappedBy = "usuario", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<UsuarioRol> roles = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getRol().getNombre()))
                .collect(Collectors.toList());
    }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return estado != null && estado; }
}
