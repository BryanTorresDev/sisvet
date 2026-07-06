package com.sisvet;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GetUsers {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("HASH_ADMIN: " + encoder.encode("admin123"));
        System.out.println("HASH_VET: " + encoder.encode("vet123"));
        System.out.println("HASH_RECEP: " + encoder.encode("recep123"));
    }
}
