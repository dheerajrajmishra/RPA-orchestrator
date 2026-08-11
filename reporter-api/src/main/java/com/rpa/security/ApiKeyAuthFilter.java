package com.rpa.security;

import com.rpa.entity.ApiKey;
import com.rpa.repository.ApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Optional;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final ApiKeyRepository apiKeyRepository;
    private static final String API_KEY_HEADER = "X-API-Key";

    public ApiKeyAuthFilter(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String apiKey = request.getHeader(API_KEY_HEADER);

        if (apiKey != null && !apiKey.isEmpty()) {
            String hash = hashKey(apiKey);
            Optional<ApiKey> keyOpt = apiKeyRepository.findByKeyHashAndIsActiveTrue(hash);

            if (keyOpt.isPresent()) {
                ApiKey validKey = keyOpt.get();
                if (validKey.getExpiresAt() == null || validKey.getExpiresAt().isAfter(OffsetDateTime.now())) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            validKey, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    
                    // Update last used
                    validKey.setLastUsedAt(OffsetDateTime.now());
                    validKey.setLastUsedIp(request.getRemoteAddr());
                    apiKeyRepository.save(validKey);
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private String hashKey(String key) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(key.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
