package com.academia.server.controllers;

import com.academia.server.exceptions.UnauthorizedAccessException;
import com.academia.server.models.GymManagementModels.Aluno;
import com.academia.server.models.GymManagementModels.AlunoRequest;
import com.academia.server.models.GymManagementModels.Instrutor;
import com.academia.server.models.GymManagementModels.InstrutorRequest;
import com.academia.server.models.GymManagementModels.Pagamento;
import com.academia.server.models.GymManagementModels.PagamentoRequest;
import com.academia.server.models.GymManagementModels.Plano;
import com.academia.server.models.GymManagementModels.PlanoRequest;
import com.academia.server.services.GymManagementService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1")
public class GymManagementController {
    private final GymManagementService service;

    public GymManagementController(GymManagementService service) {
        this.service = service;
    }

    @GetMapping("/alunos")
    public List<Aluno> listarAlunos(HttpServletRequest request) throws Exception {
        return service.listarAlunos(unidadeId(request));
    }

    @PostMapping("/alunos")
    public ResponseEntity<IdResponse> criarAluno(@RequestBody AlunoRequest body, HttpServletRequest request) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdResponse(service.criarAluno(unidadeId(request), body)));
    }

    @PutMapping("/alunos/{id}")
    public ResponseEntity<Void> atualizarAluno(@PathVariable UUID id, @RequestBody AlunoRequest body,
                                                HttpServletRequest request) throws Exception {
        service.atualizarAluno(unidadeId(request), id, body);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/alunos/{id}")
    public ResponseEntity<Void> excluirAluno(@PathVariable UUID id, HttpServletRequest request) throws Exception {
        service.excluirAluno(unidadeId(request), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/planos")
    public List<Plano> listarPlanos(HttpServletRequest request) throws Exception {
        return service.listarPlanos(unidadeId(request));
    }

    @PostMapping("/planos")
    public ResponseEntity<IdResponse> criarPlano(@RequestBody PlanoRequest body, HttpServletRequest request) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdResponse(service.criarPlano(unidadeId(request), body)));
    }

    @PutMapping("/planos/{id}")
    public ResponseEntity<Void> atualizarPlano(@PathVariable UUID id, @RequestBody PlanoRequest body,
                                                HttpServletRequest request) throws Exception {
        service.atualizarPlano(unidadeId(request), id, body);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/planos/{id}")
    public ResponseEntity<Void> excluirPlano(@PathVariable UUID id, HttpServletRequest request) throws Exception {
        service.excluirPlano(unidadeId(request), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/instrutores")
    public List<Instrutor> listarInstrutores(HttpServletRequest request) throws Exception {
        return service.listarInstrutores(unidadeId(request));
    }

    @PostMapping("/instrutores")
    public ResponseEntity<IdResponse> criarInstrutor(@RequestBody InstrutorRequest body,
                                                       HttpServletRequest request) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new IdResponse(service.criarInstrutor(unidadeId(request), body)));
    }

    @PutMapping("/instrutores/{id}")
    public ResponseEntity<Void> atualizarInstrutor(@PathVariable UUID id, @RequestBody InstrutorRequest body,
                                                     HttpServletRequest request) throws Exception {
        service.atualizarInstrutor(unidadeId(request), id, body);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/instrutores/{id}")
    public ResponseEntity<Void> excluirInstrutor(@PathVariable UUID id, HttpServletRequest request) throws Exception {
        service.excluirInstrutor(unidadeId(request), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/controle-pagamentos")
    public List<Pagamento> listarPagamentos(HttpServletRequest request) throws Exception {
        return service.listarPagamentos(unidadeId(request));
    }

    @PostMapping("/controle-pagamentos")
    public ResponseEntity<IdResponse> criarPagamento(@RequestBody PagamentoRequest body,
                                                       HttpServletRequest request) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new IdResponse(service.criarPagamento(unidadeId(request), body)));
    }

    @PutMapping("/controle-pagamentos/{id}")
    public ResponseEntity<Void> atualizarPagamento(@PathVariable UUID id, @RequestBody PagamentoRequest body,
                                                     HttpServletRequest request) throws Exception {
        service.atualizarPagamento(unidadeId(request), id, body);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/controle-pagamentos/{id}")
    public ResponseEntity<Void> excluirPagamento(@PathVariable UUID id, HttpServletRequest request) throws Exception {
        service.excluirPagamento(unidadeId(request), id);
        return ResponseEntity.noContent().build();
    }

    private UUID unidadeId(HttpServletRequest request) {
        Object value = request.getAttribute("unidadeOrganizacionalId");
        if (!(value instanceof String id) || id.isBlank()) {
            throw new UnauthorizedAccessException("A sessão não está vinculada a uma unidade organizacional.");
        }
        return UUID.fromString(id);
    }

    public record IdResponse(UUID id) {}
}
