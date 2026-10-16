package com.academia.server.services;

import com.academia.server.exceptions.NotFoundException;
import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.UnidadeOrganizacional;
import com.academia.server.repositories.UnidadeOrganizacionalRepository;
import com.academia.server.validations.RuleValidation;
import com.academia.server.validations.ValidationError;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UnidadeOrganizacionalService extends BaseService {

    private final UnidadeOrganizacionalRepository repository;

    public UnidadeOrganizacionalService(UnidadeOrganizacionalRepository repository) {
        this.repository = repository;
    }

    public UUID cadastrar(UnidadeOrganizacional unidade) throws Exception {
        validarCampos(unidade, new UUID(0L, 0L));
        return repository.cadastrar(unidade);
    }

    public void aprovarUnidade(UUID id) throws Exception {
        UnidadeOrganizacional u = repository.obter(id);
        if (u == null) throw new NotFoundException("Unidade organizacional não encontrada com o ID informado.");
        if (u.isAprovado()) throw new IllegalStateException("O acesso da unidade já está validado.");
        repository.aprovarUnidade(id);
    }

    public List<UnidadeOrganizacional> obterLista(String razaoSocial, String cnpj, Boolean aprovado, int skip, int top) throws Exception {
        return repository.obterLista(razaoSocial, cnpj, aprovado, skip, top);
    }

    public UnidadeOrganizacional obter(UUID id) throws Exception {
        UnidadeOrganizacional u = repository.obter(id);
        if (u == null) throw new NotFoundException("Unidade organizacional não encontrada com o ID informado.");
        return u;
    }

    private void validarCampos(UnidadeOrganizacional u, UUID ignoreId) throws Exception {
        List<ValidationError> errors = createErrorList();

        if (u.getRazaoSocial() == null || u.getRazaoSocial().isBlank()) {
            addError(errors, "RazaoSocial", "Informe a razão social.");
        }

        if (u.getCnpj() == null || u.getCnpj().isBlank()) {
            addError(errors, "Cnpj", "Informe o CNPJ.");
        } else if (!RuleValidation.cnpjValido(u.getCnpj())) {
            addError(errors, "Cnpj", "CNPJ inválido.");
        } else if (repository.validarDuplicidade(u.getCnpj(), ignoreId)) {
            addError(errors, "Cnpj", "Unidade organizacional já cadastrada para o CNPJ informado.");
        }

        if (u.getTelefone() == null || u.getTelefone().isBlank()) {
            addError(errors, "Telefone", "Informe o telefone.");
        }

        if (!errors.isEmpty()) throw new ValidationException(errors);
    }
}