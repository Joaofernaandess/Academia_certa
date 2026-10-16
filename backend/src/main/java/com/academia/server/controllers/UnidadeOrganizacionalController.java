package com.academia.server.controllers;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.UnidadeOrganizacional;
import com.academia.server.services.PayloadCryptoService;
import com.academia.server.services.UnidadeOrganizacionalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/unidades-organizacionais")
public class UnidadeOrganizacionalController {

    public record UnidadeOrganizacionalPostResponse(UUID unidadeOrganizacionalId, String mensagem) {}

    private final UnidadeOrganizacionalService service;
    private final PayloadCryptoService cryptoService;

    public UnidadeOrganizacionalController(UnidadeOrganizacionalService service, PayloadCryptoService cryptoService) {
        this.service = service;
        this.cryptoService = cryptoService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<UnidadeOrganizacionalPostResponse> cadastrar(@RequestBody EncryptedRequest request) throws Exception {
        UnidadeOrganizacional u = cryptoService.descriptografar(request, UnidadeOrganizacional.class);
        UUID id = service.cadastrar(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new UnidadeOrganizacionalPostResponse(id, "Unidade organizacional cadastrada com sucesso.")
        );
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<UnidadeOrganizacional>> obter(
            @RequestParam(required = false) String razaoSocial,
            @RequestParam(required = false) String cnpj,
            @RequestParam(defaultValue = "true") Boolean aprovado,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "10") int top) throws Exception {
        return ResponseEntity.ok(service.obterLista(razaoSocial, cnpj, aprovado, skip, top));
    }

    @GetMapping("/{unidadeOrganizacionalId}")
    public ResponseEntity<UnidadeOrganizacional> obterPorId(@PathVariable UUID unidadeOrganizacionalId) throws Exception {
        return ResponseEntity.ok(service.obter(unidadeOrganizacionalId));
    }

    @PatchMapping("/{unidadeOrganizacionalId}")
    public ResponseEntity<String> aprovar(@PathVariable UUID unidadeOrganizacionalId) throws Exception {
        service.aprovarUnidade(unidadeOrganizacionalId);
        return ResponseEntity.ok("Unidade organizacional aprovada com sucesso.");
    }
}