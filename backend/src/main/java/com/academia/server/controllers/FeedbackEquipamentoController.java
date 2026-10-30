package com.academia.server.controllers;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.FeedbackEquipamento;
import com.academia.server.services.FeedbackEquipamentoService;
import com.academia.server.services.PayloadCryptoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/feedbacks")
public class FeedbackEquipamentoController {

    public record FeedbackPostResponse(UUID feedbackId, String mensagem) {}

    private final FeedbackEquipamentoService service;
    private final PayloadCryptoService cryptoService;

    public FeedbackEquipamentoController(FeedbackEquipamentoService service, PayloadCryptoService cryptoService) {
        this.service = service;
        this.cryptoService = cryptoService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<FeedbackPostResponse> cadastrar(
            @RequestBody EncryptedRequest request,
            HttpServletRequest httpRequest) throws Exception {
        FeedbackEquipamento fb = cryptoService.descriptografar(request, FeedbackEquipamento.class);

        String usuarioIdAttr = (String) httpRequest.getAttribute("usuarioId");
        if (fb.getUsuarioId() == null && usuarioIdAttr != null && !usuarioIdAttr.isBlank()) {
            fb.setUsuarioId(UUID.fromString(usuarioIdAttr));
        }

        UUID id = service.cadastrar(fb);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new FeedbackPostResponse(id, "Feedback enviado com sucesso! Obrigado pela avaliação.")
        );
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<FeedbackEquipamento>> obter(
            @RequestParam(required = false) UUID unidadeOrganizacionalId,
            @RequestParam(required = false) UUID equipamentoId,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "20") int top) throws Exception {
        return ResponseEntity.ok(service.obterLista(unidadeOrganizacionalId, equipamentoId, skip, top));
    }
}   