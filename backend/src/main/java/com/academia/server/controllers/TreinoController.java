package com.academia.server.controllers;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.Treino;
import com.academia.server.services.PayloadCryptoService;
import com.academia.server.services.TreinoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/treinos")
public class TreinoController {

    private final TreinoService service;
    private final PayloadCryptoService cryptoService;

    public TreinoController(TreinoService service, PayloadCryptoService cryptoService) {
        this.service = service;
        this.cryptoService = cryptoService;
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