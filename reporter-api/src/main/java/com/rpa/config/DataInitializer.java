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
        seedKeyIfNotExists("dev_key_12345", "dev_key_", "Default Development Key");
        seedKeyIfNotExists("rpa_7acfbf88940a446998da22ce005ab4ff", "rpa_7acfbf88", "Production Worker Bot Key");
    }

    private void seedKeyIfNotExists(String rawKey, String prefix, String name) {
        String keyHash = hashKey(rawKey);
        if (apiKeyRepository.findByKeyHashAndIsActiveTrue(keyHash).isEmpty()) {
            ApiKey apiKey = new ApiKey();
            apiKey.setKeyHash(keyHash);
            apiKey.setKeyPrefix(prefix);
            apiKey.setName(name);
            apiKey.setDescription("Auto-seeded active API key for ingestion");
            apiKey.setIsActive(true);
            apiKey.setPermissions(List.of("report"));
            apiKey.setCreatedBy("SystemInitializer");
            apiKeyRepository.save(apiKey);

            log.info("==================================================================");
            log.info("[REPORTER-API] Initialized API Key: {} ({})", rawKey, name);
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
