package com.academia.server.controllers;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.Exercicio;
import com.academia.server.services.ExercicioService;
import com.academia.server.services.PayloadCryptoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/exercicios")
public class ExercicioController {

    public record ExercicioPostResponse(UUID exercicioId, String mensagem) {}

    private final ExercicioService service;
    private final PayloadCryptoService cryptoService;

    public ExercicioController(ExercicioService service, PayloadCryptoService cryptoService) {
        this.service = service;
        this.cryptoService = cryptoService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<ExercicioPostResponse> cadastrar(@RequestBody EncryptedRequest request) throws Exception {
        Exercicio ex = cryptoService.descriptografar(request, Exercicio.class);
        UUID id = service.cadastrar(ex);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ExercicioPostResponse(id, "Exercício cadastrado com sucesso.")
        );
    }

    @PutMapping("/{exercicioId}")
    public ResponseEntity<String> atualizar(@PathVariable UUID exercicioId, @RequestBody EncryptedRequest request) throws Exception {
        Exercicio ex = cryptoService.descriptografar(request, Exercicio.class);
        service.atualizar(ex, exercicioId);
        return ResponseEntity.ok("Exercício atualizado com sucesso.");
    }

    @DeleteMapping("/{exercicioId}")
    public ResponseEntity<String> excluir(@PathVariable UUID exercicioId) throws Exception {
        service.excluir(exercicioId);
        return ResponseEntity.ok("Exercício excluído com sucesso.");
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Exercicio>> obter(
            @RequestParam(required = false) UUID unidadeOrganizacionalId,
            @RequestParam(required = false) String nome,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "50") int top) throws Exception {
        return ResponseEntity.ok(service.obterLista(unidadeOrganizacionalId, nome, skip, top));
    }

    @GetMapping("/{exercicioId}")
    public ResponseEntity<Exercicio> obterPorId(@PathVariable UUID exercicioId) throws Exception {
        return ResponseEntity.ok(service.obter(exercicioId));
    }
}