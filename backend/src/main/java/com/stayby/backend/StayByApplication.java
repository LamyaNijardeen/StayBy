package com.stayby.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StayByApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                StayByApplication.class,
                args
        );
    }
}