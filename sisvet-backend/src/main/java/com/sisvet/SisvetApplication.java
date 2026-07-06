package com.sisvet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SisvetApplication {
    public static void main(String[] args) {
        SpringApplication.run(SisvetApplication.class, args);
    }
}
