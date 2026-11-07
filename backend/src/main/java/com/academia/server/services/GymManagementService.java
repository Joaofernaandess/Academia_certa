package com.academia.server.services;

import com.academia.server.exceptions.NotFoundException;
import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.GymManagementModels.Aluno;
import com.academia.server.models.GymManagementModels.AlunoRequest;
import com.academia.server.models.GymManagementModels.Instrutor;
import com.academia.server.models.GymManagementModels.InstrutorRequest;
import com.academia.server.models.GymManagementModels.Pagamento;
import com.academia.server.models.GymManagementModels.PagamentoRequest;
import com.academia.server.models.GymManagementModels.Plano;
import com.academia.server.models.GymManagementModels.PlanoRequest;
import com.academia.server.repositories.GymManagementRepository;
import com.academia.server.validations.ValidationError;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class GymManagementService extends BaseService {
    private static final String ATIVO = "ATIVO";
    private static final String INATIVO = "INATIVO";
    private static final String PENDENTE = "PENDENTE";
    private static final String PAGO = "PAGO";
    private static final String CANCELADO = "CANCELADO";

    private final GymManagementRepository repository;

    public GymManagementService(GymManagementRepository repository) {
        this.repository = repository;
    }

    public List<Aluno> listarAlunos(UUID unidadeId) throws Exception {
        repository.sincronizarSituacaoAlunos(unidadeId);
        return repository.listarAlunos(unidadeId);
    }

    public UUID criarAluno(UUID unidadeId, AlunoRequest request) throws Exception {
        return repository.criarAluno(unidadeId, validarAluno(unidadeId, request, new UUID(0, 0)));
    }

    public void atualizarAluno(UUID unidadeId, UUID id, AlunoRequest request) throws Exception {
        Aluno item = validarAluno(unidadeId, request, id);
        if (!repository.alunoExiste(unidadeId, id)) {
            throw new NotFoundException("Aluno não encontrado.");
        }
        repository.atualizarAluno(unidadeId, id, item);
        repository.sincronizarSituacaoAlunos(unidadeId);
    }

    public void excluirAluno(UUID unidadeId, UUID id) throws Exception {
        if (repository.alunoPossuiPagamentos(unidadeId, id)) {
            throw new IllegalStateException("Não é possível excluir um aluno que possui pagamentos cadastrados.");
        }
        if (repository.excluirAluno(unidadeId, id) == 0) throw new NotFoundException("Aluno não encontrado.");
    }

    public List<Plano> listarPlanos(UUID unidadeId) throws Exception {
        return repository.listarPlanos(unidadeId);
    }

    public UUID criarPlano(UUID unidadeId, PlanoRequest request) throws Exception {
        return repository.criarPlano(unidadeId, validarPlano(request));
    }

    public void atualizarPlano(UUID unidadeId, UUID id, PlanoRequest request) throws Exception {
        Plano item = validarPlano(request);
        if (!repository.planoExiste(unidadeId, id)) {
            throw new NotFoundException("Plano não encontrado.");
        }
        repository.atualizarPlano(unidadeId, id, item);
    }

    public void excluirPlano(UUID unidadeId, UUID id) throws Exception {
        if (repository.planoPossuiPagamentos(unidadeId, id)) {
            throw new IllegalStateException("Não é possível excluir um plano vinculado a pagamentos.");
        }
        if (repository.excluirPlano(unidadeId, id) == 0) throw new NotFoundException("Plano não encontrado.");
    }

    public List<Instrutor> listarInstrutores(UUID unidadeId) throws Exception {
        return repository.listarInstrutores(unidadeId);
    }

    public UUID criarInstrutor(UUID unidadeId, InstrutorRequest request) throws Exception {
        return repository.criarInstrutor(unidadeId,
                validarInstrutor(unidadeId, request, new UUID(0, 0)));
    }

    public void atualizarInstrutor(UUID unidadeId, UUID id, InstrutorRequest request) throws Exception {
        Instrutor item = validarInstrutor(unidadeId, request, id);
        if (!repository.instrutorExiste(unidadeId, id)) {
            throw new NotFoundException("Instrutor não encontrado.");
        }
        repository.atualizarInstrutor(unidadeId, id, item);
    }

    public void excluirInstrutor(UUID unidadeId, UUID id) throws Exception {
        if (repository.excluirInstrutor(unidadeId, id) == 0) throw new NotFoundException("Instrutor não encontrado.");
    }

    public List<Pagamento> listarPagamentos(UUID unidadeId) throws Exception {
        repository.sincronizarSituacaoAlunos(unidadeId);
        return repository.listarPagamentos(unidadeId);
    }

    public UUID criarPagamento(UUID unidadeId, PagamentoRequest request) throws Exception {
        Pagamento item = validarPagamento(unidadeId, request);
        UUID id = repository.criarPagamento(unidadeId, item);
        repository.sincronizarSituacaoAlunos(unidadeId);
        return id;
    }

    public void atualizarPagamento(UUID unidadeId, UUID id, PagamentoRequest request) throws Exception {
        Pagamento item = validarPagamento(unidadeId, request);
        if (!repository.pagamentoExiste(unidadeId, id)) {
            throw new NotFoundException("Pagamento não encontrado.");
        }
        repository.atualizarPagamento(unidadeId, id, item);
        repository.sincronizarSituacaoAlunos(unidadeId);
    }

    public void excluirPagamento(UUID unidadeId, UUID id) throws Exception {
        if (repository.excluirPagamento(unidadeId, id) == 0) throw new NotFoundException("Pagamento não encontrado.");
        repository.sincronizarSituacaoAlunos(unidadeId);
    }

    private Aluno validarAluno(UUID unidadeId, AlunoRequest request, UUID ignorarId) throws Exception {
        List<ValidationError> errors = createErrorList();
        String nome = request.nome() == null ? "" : request.nome().trim();
        String cpf = digitos(request.cpf());
        String email = textoOpcional(request.email());
        String telefone = textoOpcional(request.telefone());
        String situacao = situacao(request.situacao());

        if (nome.isBlank()) addError(errors, "nome", "Informe o nome do aluno.");
        if (nome.length() > 120) addError(errors, "nome", "O nome do aluno deve ter até 120 caracteres.");
        if (cpf.length() != 11) addError(errors, "cpf", "Informe um CPF com 11 números.");
        else if (repository.alunoCpfEmUso(unidadeId, cpf, ignorarId)) {
            addError(errors, "cpf", "Já existe um aluno com este CPF.");
        }
        validarEmail(errors, email);
        validarTelefone(errors, telefone);
        validarSituacao(errors, situacao);
        if (!errors.isEmpty()) throw new ValidationException(errors);
        return new Aluno(null, nome, cpf, email, telefone, request.dataNascimento(), situacao);
    }

    private Plano validarPlano(PlanoRequest request) throws Exception {
        List<ValidationError> errors = createErrorList();
        String nome = request.nome() == null ? "" : request.nome().trim();
        BigDecimal valor = request.valor();
        Integer duracaoDias = request.duracaoDias();
        if (nome.isBlank()) addError(errors, "nome", "Informe o nome do plano.");
        if (nome.length() > 100) addError(errors, "nome", "O nome do plano deve ter até 100 caracteres.");
        String descricao = textoOpcional(request.descricao());
        if (descricao.length() > 500) addError(errors, "descricao", "A descrição deve ter até 500 caracteres.");
        validarValor(errors, valor, "valor");
        if (duracaoDias == null || duracaoDias < 1) addError(errors, "duracaoDias", "Informe uma duração de pelo menos 1 dia.");
        if (!errors.isEmpty()) throw new ValidationException(errors);
        return new Plano(null, nome, descricao, valor, duracaoDias,
                Boolean.TRUE.equals(request.ativo()));
    }

    private Instrutor validarInstrutor(UUID unidadeId, InstrutorRequest request, UUID ignorarId) throws Exception {
        List<ValidationError> errors = createErrorList();
        String nome = request.nome() == null ? "" : request.nome().trim();
        String cpf = digitos(request.cpf());
        String email = textoOpcional(request.email());
        String telefone = textoOpcional(request.telefone());
        String especialidade = textoOpcional(request.especialidade());
        if (nome.isBlank()) addError(errors, "nome", "Informe o nome do instrutor.");
        if (nome.length() > 120) addError(errors, "nome", "O nome do instrutor deve ter até 120 caracteres.");
        if (cpf.length() != 11) addError(errors, "cpf", "Informe um CPF com 11 números.");
        else if (repository.instrutorCpfEmUso(unidadeId, cpf, ignorarId)) {
            addError(errors, "cpf", "Já existe um instrutor com este CPF.");
        }
        validarEmail(errors, email);
        validarTelefone(errors, telefone);
        if (especialidade.isBlank()) addError(errors, "especialidade", "Informe a especialidade.");
        if (especialidade.length() > 120) addError(errors, "especialidade", "A especialidade deve ter até 120 caracteres.");
        if (!errors.isEmpty()) throw new ValidationException(errors);
        return new Instrutor(null, nome, cpf, email, telefone, especialidade, Boolean.TRUE.equals(request.ativo()));
    }

    private Pagamento validarPagamento(UUID unidadeId, PagamentoRequest request) throws Exception {
        List<ValidationError> errors = createErrorList();
        if (request.alunoId() == null || !repository.alunoExiste(unidadeId, request.alunoId())) {
            addError(errors, "alunoId", "Selecione um aluno válido.");
        }
        if (request.planoId() == null || !repository.planoExiste(unidadeId, request.planoId())) {
            addError(errors, "planoId", "Selecione um plano válido.");
        }
        BigDecimal valor = request.valor();
        validarValor(errors, valor, "valor");
        if (request.dataVencimento() == null) addError(errors, "dataVencimento", "Informe a data de vencimento.");
        String situacao = request.situacao() == null ? "" : request.situacao().trim().toUpperCase();
        if (!List.of(PENDENTE, PAGO, CANCELADO).contains(situacao)) {
            addError(errors, "situacao", "Selecione uma situação de pagamento válida.");
        }
        if (PAGO.equals(situacao) && request.dataPagamento() == null) {
            addError(errors, "dataPagamento", "Informe a data em que o pagamento foi realizado.");
        }
        if (!PAGO.equals(situacao) && request.dataPagamento() != null) {
            addError(errors, "dataPagamento", "A data de pagamento só pode ser informada para pagamentos pagos.");
        }
        if (!errors.isEmpty()) throw new ValidationException(errors);
        return new Pagamento(null, request.alunoId(), null, request.planoId(), null, valor,
                request.dataVencimento(), request.dataPagamento(), situacao);
    }

    private void validarEmail(List<ValidationError> errors, String email) {
        if (email.length() > 160) {
            addError(errors, "email", "O e-mail deve ter até 160 caracteres.");
            return;
        }
        if (!email.isBlank() && !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            addError(errors, "email", "Informe um e-mail válido.");
        }
    }

    private void validarTelefone(List<ValidationError> errors, String telefone) {
        if (telefone.length() > 20) addError(errors, "telefone", "O telefone deve ter até 20 caracteres.");
    }

    private void validarValor(List<ValidationError> errors, BigDecimal valor, String field) {
        if (valor == null || valor.signum() <= 0) {
            addError(errors, field, "O valor deve ser maior que zero.");
        } else if (valor.scale() > 2 || valor.compareTo(new BigDecimal("99999999.99")) > 0) {
            addError(errors, field, "Informe um valor válido com até duas casas decimais.");
        }
    }

    private void validarSituacao(List<ValidationError> errors, String situacao) {
        if (!ATIVO.equals(situacao) && !INATIVO.equals(situacao)) {
            addError(errors, "situacao", "Selecione uma situação válida.");
        }
    }

    private String situacao(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private String digitos(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private String textoOpcional(String value) {
        return value == null ? "" : value.trim();
    }
}
