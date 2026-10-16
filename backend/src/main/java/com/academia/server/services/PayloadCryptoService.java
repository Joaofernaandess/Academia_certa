package com.academia.server.services;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.EncryptedResponse;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Service
public class PayloadCryptoService {

    private final ObjectMapper objectMapper;
    private PrivateKey rsaPrivateKey;

    public PayloadCryptoService(@Value("${encrypt.private.key:}") String privateKeyBase64) {
        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        if (privateKeyBase64 != null && !privateKeyBase64.isBlank()) {
            try {
                String cleanKey = privateKeyBase64
                        .replace("-----BEGIN PRIVATE KEY-----", "")
                        .replace("-----END PRIVATE KEY-----", "")
                        .replaceAll("\\s+", "");
                byte[] keyBytes = Base64.getDecoder().decode(cleanKey);
                PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
                this.rsaPrivateKey = KeyFactory.getInstance("RSA").generatePrivate(spec);
            } catch (Exception ignored) {
                this.rsaPrivateKey = null;
            }
        }
    }

    public <T> T descriptografar(EncryptedRequest request, Class<T> clazz) {
        if (request == null || request.getPayload() == null || request.getPayload().isBlank()) {
            throw new IllegalStateException("Payload criptografado não informado.");
        }
        try {
            String json;
            String payload = request.getPayload().trim();

            // Modo 1: Se já for um JSON direto
            if (payload.startsWith("{")) {
                json = payload;
            }
            // Modo 2: Se não houver chave RSA ou se estiver em modo simplificado Base64
            else if (rsaPrivateKey == null || "SIMPLE".equals(request.getKey())) {
                byte[] decoded = Base64.getDecoder().decode(payload);
                json = new String(decoded, StandardCharsets.UTF_8);
            }
            // Modo 3: Criptografia Híbrida Original (RSA-OAEP-SHA256 + AES-GCM)
            else if (request.getKey() == null || request.getKey().isBlank() || request.getIv() == null || request.getIv().isBlank()) {
                json = new String(decryptRsa(payload), StandardCharsets.UTF_8);
            } else {
                json = new String(decryptHybrid(request), StandardCharsets.UTF_8);
            }

            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            throw new IllegalStateException("Payload criptografado inválido.");
        }
    }

    public EncryptedResponse criptografarResposta(EncryptedRequest request, Object response) {
        try {
            String json = objectMapper.writeValueAsString(response);

            if (rsaPrivateKey == null || request.getKey() == null || request.getKey().isBlank() || "SIMPLE".equals(request.getKey())) {
                return new EncryptedResponse(
                        "SIMPLE",
                        Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8))
                );
            }

            byte[] aesKey = decryptRsa(request.getKey());
            byte[] iv = new byte[12];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(aesKey, "AES"), new GCMParameterSpec(128, iv));
            byte[] cipherTextWithTag = cipher.doFinal(json.getBytes(StandardCharsets.UTF_8));

            return new EncryptedResponse(
                    Base64.getEncoder().encodeToString(iv),
                    Base64.getEncoder().encodeToString(cipherTextWithTag)
            );
        } catch (Exception e) {
            throw new IllegalStateException("Não foi possível criptografar a resposta.");
        }
    }

    private byte[] decryptRsa(String base64Cipher) throws Exception {
        byte[] encryptedBytes = Base64.getDecoder().decode(base64Cipher);
        Cipher rsa = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        OAEPParameterSpec oaepParams = new OAEPParameterSpec(
                "SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT
        );
        rsa.init(Cipher.DECRYPT_MODE, rsaPrivateKey, oaepParams);
        return rsa.doFinal(encryptedBytes);
    }

    private byte[] decryptHybrid(EncryptedRequest request) throws Exception {
        byte[] aesKey = decryptRsa(request.getKey());
        byte[] iv = Base64.getDecoder().decode(request.getIv());
        byte[] payloadBytes = Base64.getDecoder().decode(request.getPayload());

        Cipher aes = Cipher.getInstance("AES/GCM/NoPadding");
        aes.init(Cipher.DECRYPT_MODE, new SecretKeySpec(aesKey, "AES"), new GCMParameterSpec(128, iv));
        return aes.doFinal(payloadBytes);
    }
}