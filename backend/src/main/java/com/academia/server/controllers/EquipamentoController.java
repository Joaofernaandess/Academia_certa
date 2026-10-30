package com.academia.server.controllers;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.Equipamento;
import com.academia.server.services.EquipamentoService;
import com.academia.server.services.PayloadCryptoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/equipamentos")
public class EquipamentoController {

    public record EquipamentoPostResponse(UUID equipamentoId, String mensagem) {}

    private final EquipamentoService service;
    private final PayloadCryptoService cryptoService;

    public EquipamentoController(EquipamentoService service, PayloadCryptoService cryptoService) {
        this.service = service;
        this.cryptoService = cryptoService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<EquipamentoPostResponse> cadastrar(@RequestBody EncryptedRequest request) throws Exception {
        Equipamento eq = cryptoService.descriptografar(request, Equipamento.class);
        UUID id = service.cadastrar(eq);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new EquipamentoPostResponse(id, "Equipamento cadastrado com sucesso.")
        );
    }

    @PutMapping("/{equipamentoId}")
    public ResponseEntity<String> atualizar(@PathVariable UUID equipamentoId, @RequestBody EncryptedRequest request) throws Exception {
        Equipamento eq = cryptoService.descriptografar(request, Equipamento.class);
        service.atualizar(eq, equipamentoId);
        return ResponseEntity.ok("Equipamento atualizado com sucesso.");
    }

    @DeleteMapping("/{equipamentoId}")
    public ResponseEntity<String> excluir(@PathVariable UUID equipamentoId) throws Exception {
        service.excluir(equipamentoId);
        return ResponseEntity.ok("Equipamento excluído com sucesso.");
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Equipamento>> obter(
            @RequestParam(required = false) UUID unidadeOrganizacionalId,
            @RequestParam(required = false) String nome,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "10") int top) throws Exception {
        return ResponseEntity.ok(service.obterLista(unidadeOrganizacionalId, nome, skip, top));
    }

    @GetMapping("/{equipamentoId}")
    public ResponseEntity<Equipamento> obterPorId(@PathVariable UUID equipamentoId) throws Exception {
        return ResponseEntity.ok(service.obter(equipamentoId));
    }
}