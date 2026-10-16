package com.academia.server.controllers;

import com.academia.server.models.Auth;
import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.EncryptedResponse;
import com.academia.server.services.AuthService;
import com.academia.server.services.PayloadCryptoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final PayloadCryptoService cryptoService;

    public AuthController(AuthService authService, PayloadCryptoService cryptoService) {
        this.authService = authService;
        this.cryptoService = cryptoService;
    }

    @PostMapping("/login")
    public ResponseEntity<Auth.AuthLoginResponse> login(@RequestBody EncryptedRequest request) throws Exception {
        Auth auth = cryptoService.descriptografar(request, Auth.class);
        return ResponseEntity.ok(authService.login(auth));
    }

    @PostMapping("/forgot")
    public ResponseEntity<String> forgot(@RequestBody EncryptedRequest request) throws Exception {
        Auth.AuthForgot dto = cryptoService.descriptografar(request, Auth.AuthForgot.class);
        authService.esquecerSenha(dto);
        return ResponseEntity.ok("Se as informações estiverem corretas, você receberá um código de recuperação.");
    }

    @PostMapping("/registration-code")
    public ResponseEntity<String> registrationCode(@RequestBody EncryptedRequest request) throws Exception {
        Auth.AuthForgot dto = cryptoService.descriptografar(request, Auth.AuthForgot.class);
        authService.reenviarCodigoCadastro(dto);
        return ResponseEntity.ok("Código reenviado com sucesso.");
    }

    @PostMapping("/verify")
    public ResponseEntity<EncryptedResponse> verify(@RequestBody EncryptedRequest request) throws Exception {
        Auth.AuthVerify dto = cryptoService.descriptografar(request, Auth.AuthVerify.class);
        Auth.AuthVerifyResponse response = authService.verificarCodigo(dto);
        return ResponseEntity.ok(cryptoService.criptografarResposta(request, response));
    }

    @PostMapping("/reset")
    public ResponseEntity<String> reset(@RequestBody EncryptedRequest request) throws Exception {
        Auth.AuthReset dto = cryptoService.descriptografar(request, Auth.AuthReset.class);
        authService.redefinirSenha(dto);
        return ResponseEntity.ok("Senha redefinida com sucesso.");
    }
}