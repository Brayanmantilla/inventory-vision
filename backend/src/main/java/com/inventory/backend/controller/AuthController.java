package com.inventory.backend.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if ("admin".equals(username) && "admin123".equals(password)) {
            String token = Jwts.builder()
                    .subject(username)
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                    .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .compact();
            return ResponseEntity.ok(Map.of("token", token));
        }
        return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
    }
}