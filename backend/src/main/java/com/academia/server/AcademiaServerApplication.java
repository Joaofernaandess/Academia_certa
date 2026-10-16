package com.academia.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AcademiaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AcademiaServerApplication.class, args);
    }

    // Equivalente ao IPasswordHasher<Usuario> do Program.cs
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}   