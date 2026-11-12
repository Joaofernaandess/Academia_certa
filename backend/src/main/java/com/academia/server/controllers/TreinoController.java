package com.academia.server.controllers;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.Treino;
import com.academia.server.services.PayloadCryptoService;
import com.academia.server.services.TreinoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/treinos")
public class TreinoController {

    public record TreinoPostResponse(UUID treinoId, String mensagem) {}

    private final TreinoService service;
    private final PayloadCryptoService cryptoService;

    public TreinoController(TreinoService service, PayloadCryptoService cryptoService) {
        this.service = service;
        this.cryptoService = cryptoService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<TreinoPostResponse> cadastrar(@RequestBody EncryptedRequest request) throws Exception {
        Treino treino = cryptoService.descriptografar(request, Treino.class);
        UUID id = service.cadastrar(treino);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new TreinoPostResponse(id, "Ficha de treino criada com sucesso!")
        );
    }

    @PutMapping("/{treinoId}")
    public ResponseEntity<String> atualizar(@PathVariable UUID treinoId, @RequestBody EncryptedRequest request) throws Exception {
        Treino treino = cryptoService.descriptografar(request, Treino.class);
        service.atualizar(treino, treinoId);
        return ResponseEntity.ok("Ficha de treino atualizada com sucesso!");
    }

    @DeleteMapping("/{treinoId}")
    public ResponseEntity<String> excluir(@PathVariable UUID treinoId) throws Exception {
        service.excluir(treinoId);
        return ResponseEntity.ok("Ficha de treino excluída com sucesso.");
    }

    @GetMapping("/{treinoId}")
    public ResponseEntity<Treino> obterPorId(@PathVariable UUID treinoId) throws Exception {
        return ResponseEntity.ok(service.obterPorId(treinoId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Treino>> obterTreinosDoUsuario(@PathVariable UUID usuarioId) throws Exception {
        return ResponseEntity.ok(service.obterTreinosDoUsuario(usuarioId));
    }

    @PatchMapping("/exercicios/{exercicioId}/concluido")
    public ResponseEntity<String> alternarConcluido(
            @PathVariable UUID exercicioId,
            @RequestBody EncryptedRequest request) throws Exception {
        Treino.AlternarStatusRequest req = cryptoService.descriptografar(request, Treino.AlternarStatusRequest.class);
        service.alternarConcluido(exercicioId, req.isConcluido());
        return ResponseEntity.ok("Status do exercício atualizado.");
    }
}