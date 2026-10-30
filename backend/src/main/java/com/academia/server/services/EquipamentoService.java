package com.academia.server.services;

import com.academia.server.exceptions.NotFoundException;
import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.Equipamento;
import com.academia.server.repositories.EquipamentoRepository;
import com.academia.server.validations.ValidationError;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EquipamentoService extends BaseService {

    private final EquipamentoRepository repository;

    public EquipamentoService(EquipamentoRepository repository) {
        this.repository = repository;
    }

    public UUID cadastrar(Equipamento eq) throws Exception {
        validarCampos(eq, new UUID(0L, 0L));
        return repository.cadastrar(eq);
    }

    public void atualizar(Equipamento eq, UUID equipamentoId) throws Exception {
        validarCampos(eq, equipamentoId);
        int affected = repository.atualizar(eq, equipamentoId);
        if (affected <= 0) throw new NotFoundException("Equipamento não encontrado com o ID informado.");
    }

    public void excluir(UUID equipamentoId) throws Exception {
        int affected = repository.excluir(equipamentoId);
        if (affected <= 0) throw new NotFoundException("Equipamento não encontrado com o ID informado.");
    }

    public Equipamento obter(UUID equipamentoId) throws Exception {
        Equipamento eq = repository.obter(equipamentoId);
        if (eq == null) throw new NotFoundException("Equipamento não encontrado com o ID informado.");
        return eq;
    }

    public List<Equipamento> obterLista(UUID unidadeOrganizacionalId, String nome, int skip, int top) throws Exception {
        return repository.obterLista(unidadeOrganizacionalId, nome, skip, top);
    }

    private void validarCampos(Equipamento eq, UUID ignoreId) throws Exception {
        List<ValidationError> errors = createErrorList();
        eq.setNome(eq.getNome() != null ? eq.getNome().trim() : "");

        if (eq.getUnidadeOrganizacionalId() == null) {
            addError(errors, "UnidadeOrganizacionalId", "Informe a unidade organizacional.");
        }

        if (eq.getNome().isBlank()) {
            addError(errors, "Nome", "Informe o nome do equipamento.");
        } else if (eq.getUnidadeOrganizacionalId() != null &&
                   repository.validarDuplicidade(eq.getNome(), eq.getUnidadeOrganizacionalId(), ignoreId)) {
            addError(errors, "Nome", "Já existe um equipamento cadastrado com este nome.");
        }

        if (!errors.isEmpty()) throw new ValidationException(errors);
    }
}