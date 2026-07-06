package com.sisvet;

import com.sisvet.feign.dto.ReniecResponseDTO;
import com.sisvet.service.impl.IntegracionServiceImpl;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

@SpringBootApplication
public class TestDniQuery {

    public static void main(String[] args) {
        System.setProperty("spring.profiles.active", "test");
        System.setProperty("server.port", "0");
        SpringApplication.run(TestDniQuery.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        return args -> {
            try {
                IntegracionServiceImpl service = ctx.getBean(IntegracionServiceImpl.class);
                System.out.println("\n========================================");
                System.out.println("TESTING DNI QUERY FOR: 08571093");
                ReniecResponseDTO result = service.consultarDni("08571093", "127.0.0.1");
                System.out.println("Result Success: " + result.isSuccess());
                System.out.println("Result Message: " + result.getMessage());
                System.out.println("Result DNI: " + result.getDni());
                System.out.println("Result Nombres: " + result.getNombres());
                System.out.println("Result ApPaterno: " + result.getApellidoPaterno());
                System.out.println("Result ApMaterno: " + result.getApellidoMaterno());
                System.out.println("========================================\n");
            } catch (Exception e) {
                System.out.println("\n========================================");
                System.out.println("TESTING DNI QUERY FOR: 47403056 - FAILED");
                e.printStackTrace();
                System.out.println("========================================\n");
            }
            System.exit(0);
        };
    }
}
