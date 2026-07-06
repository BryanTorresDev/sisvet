package com.sisvet.config;

import com.sisvet.exception.BusinessException;
import com.sisvet.exception.EntityNotFoundException;
import feign.Request;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class FeignConfig {

    @Bean
    public Request.Options feignOptions() {
        return new Request.Options(5, TimeUnit.SECONDS, 10, TimeUnit.SECONDS, true);
    }

    @Bean
    public ErrorDecoder feignErrorDecoder() {
        return (methodKey, response) -> switch (response.status()) {
            case 404 -> new EntityNotFoundException("Recurso no encontrado en servicio externo");
            case 401 -> new BusinessException("Token APISPERU inválido o expirado");
            case 429 -> new BusinessException("Límite de consultas alcanzado en servicio externo");
            default  -> new BusinessException("Error al consultar API externa: HTTP " + response.status());
        };
    }
}
