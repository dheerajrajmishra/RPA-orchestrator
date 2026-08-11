package com.rpa.config;

import com.rpa.entity.ApiKey;
import com.rpa.repository.ApiKeyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final ApiKeyRepository apiKeyRepository;

    public DataInitializer(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (apiKeyRepository.count() == 0) {
            String rawKey = "dev_key_12345";
            String keyHash = hashKey(rawKey);

            ApiKey defaultKey = new ApiKey();
            defaultKey.setKeyHash(keyHash);
            defaultKey.setKeyPrefix("dev_key_");
            defaultKey.setName("Default Development Key");
            defaultKey.setDescription("Auto-generated default API key for development and testing");
            defaultKey.setIsActive(true);
            defaultKey.setPermissions(List.of("report"));
            defaultKey.setCreatedBy("SystemInitializer");

            apiKeyRepository.save(defaultKey);

            log.info("==================================================================");
            log.info("[REPORTER-API] Initialized default API Key for development: {}", rawKey);
            log.info("==================================================================");
        }
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
        } catch (Exception e) {
            throw new RuntimeException("Error hashing key", e);
        }
    }
}
