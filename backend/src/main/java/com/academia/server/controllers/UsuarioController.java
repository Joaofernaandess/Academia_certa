package com.academia.server.controllers;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.Usuario;
import com.academia.server.services.PayloadCryptoService;
import com.academia.server.services.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/usuarios")
public class UsuarioController {

    public record UsuarioPostResponse(UUID usuarioId, String mensagem) {}

    private final UsuarioService service;
    private final PayloadCryptoService cryptoService;

    public UsuarioController(UsuarioService service, PayloadCryptoService cryptoService) {
        this.service = service;
        this.cryptoService = cryptoService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<UsuarioPostResponse> cadastrar(@RequestBody EncryptedRequest request) throws Exception {
        Usuario usuario = cryptoService.descriptografar(request, Usuario.class);
        UUID usuarioId = service.cadastrar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new UsuarioPostResponse(usuarioId, "Usuário cadastrado com sucesso. Informe o código enviado para validar o cadastro.")
        );
    }

    @PatchMapping("/{usuarioId}/nome")
    public ResponseEntity<String> atualizarNome(@PathVariable UUID usuarioId, @RequestBody EncryptedRequest request) throws Exception {
        Usuario.UsuarioPatchRequest patch = cryptoService.descriptografar(request, Usuario.UsuarioPatchRequest.class);
        service.atualizarNome(patch, usuarioId);
        return ResponseEntity.ok("Nome atualizado com sucesso.");
    }

    @PatchMapping("/{usuarioId}")
    public ResponseEntity<String> validarAcesso(@PathVariable UUID usuarioId) throws Exception {
        service.validarAcesso(usuarioId);
        return ResponseEntity.ok("Acesso do usuário validado com sucesso.");
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Usuario.UsuarioGetResponse>> obter(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) UUID unidadeOrganizacionalId,
            @RequestParam(required = false) Boolean cadastroCompleto,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "10") int top) throws Exception {
        return ResponseEntity.ok(service.obterLista(username, unidadeOrganizacionalId, cadastroCompleto, skip, top));
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<Usuario> obterPorId(@PathVariable UUID usuarioId) throws Exception {
        return ResponseEntity.ok(service.obter(usuarioId));
    }
}