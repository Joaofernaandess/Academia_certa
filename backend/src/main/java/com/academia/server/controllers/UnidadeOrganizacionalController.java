package com.academia.server.controllers;

import com.academia.server.models.EncryptedRequest;
import com.academia.server.models.LogoImagem;
import com.academia.server.models.UnidadeOrganizacional;
import com.academia.server.exceptions.ForbiddenException;
import com.academia.server.exceptions.UnauthorizedAccessException;
import com.academia.server.services.PayloadCryptoService;
import com.academia.server.services.UnidadeOrganizacionalService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping("/{unidadeOrganizacionalId}/logo")
    public ResponseEntity<byte[]> obterLogo(@PathVariable UUID unidadeOrganizacionalId) throws Exception {
        LogoImagem logo = service.obterLogo(unidadeOrganizacionalId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(logo.contentType()))
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .body(logo.dados());
    }

    @PatchMapping(value = "/{unidadeOrganizacionalId}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> atualizarLogo(
            @PathVariable UUID unidadeOrganizacionalId,
            @RequestParam("arquivo") MultipartFile arquivo,
            HttpServletRequest request) throws Exception {
        validarAdministradorDaUnidade(request, unidadeOrganizacionalId);
        service.atualizarLogo(unidadeOrganizacionalId, arquivo.getContentType(), arquivo.getBytes());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{unidadeOrganizacionalId}/logo")
    public ResponseEntity<Void> removerLogo(
            @PathVariable UUID unidadeOrganizacionalId,
            HttpServletRequest request) throws Exception {
        validarAdministradorDaUnidade(request, unidadeOrganizacionalId);
        service.removerLogo(unidadeOrganizacionalId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{unidadeOrganizacionalId}")
    public ResponseEntity<String> aprovar(@PathVariable UUID unidadeOrganizacionalId) throws Exception {
        service.aprovarUnidade(unidadeOrganizacionalId);
        return ResponseEntity.ok("Unidade organizacional aprovada com sucesso.");
    }

    private void validarAdministradorDaUnidade(HttpServletRequest request, UUID unidadeId) {
        Object claimUnidade = request.getAttribute("unidadeOrganizacionalId");
        if (!(claimUnidade instanceof String id) || id.isBlank()) {
            throw new UnauthorizedAccessException("A sessão não está vinculada a uma unidade organizacional.");
        }
        if (!unidadeId.toString().equalsIgnoreCase(id)) {
            throw new ForbiddenException("Não é permitido alterar a identidade visual de outra academia.");
        }
        if (!"Admin".equals(request.getAttribute("role"))) {
            throw new ForbiddenException("Somente um administrador da academia pode alterar a logo.");
        }
    }
}