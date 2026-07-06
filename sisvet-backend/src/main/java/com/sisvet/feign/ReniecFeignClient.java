package com.sisvet.feign;

import com.sisvet.feign.dto.ReniecResponseDTO;
import com.sisvet.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
        name = "reniec-client",
        url = "${apisperu.base-url}",
        configuration = FeignConfig.class
)
public interface ReniecFeignClient {

    @GetMapping("/v1/dni")
    ReniecResponseDTO consultarDni(
            @RequestParam("numero") String numero,
            @RequestHeader("Authorization") String token
    );
}
