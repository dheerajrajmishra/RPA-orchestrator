package com.rpa.backend.controller;

import com.rpa.backend.dto.AuthRequest;
import com.rpa.backend.dto.AuthResponse;
import com.rpa.backend.entity.User;
import com.rpa.backend.repository.UserRepository;
import com.rpa.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping({"/api/auth/login", "/api/v1/auth/login"})
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String identifier = request.getUsername() != null && !request.getUsername().isBlank()
                ? request.getUsername()
                : request.getEmail();
                
        if (identifier == null || identifier.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username or email is required");
        }

        User user = userRepository.findByUsernameOrEmail(identifier, identifier).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        if (user.getPasswordHash() != null && passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}
