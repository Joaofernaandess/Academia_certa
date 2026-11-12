package com.academia.server.services;

import com.academia.server.exceptions.NotFoundException;
import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.Exercicio;
import com.academia.server.repositories.ExercicioRepository;
import com.academia.server.validations.ValidationError;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ExercicioService extends BaseService {

    private final ExercicioRepository repository;

    public ExercicioService(ExercicioRepository repository) {
        this.repository = repository;
    }

    public UUID cadastrar(Exercicio ex) throws Exception {
        validarCampos(ex, new UUID(0L, 0L));
        return repository.cadastrar(ex);
    }

    public void atualizar(Exercicio ex, UUID exercicioId) throws Exception {
        validarCampos(ex, exercicioId);
        int affected = repository.atualizar(ex, exercicioId);
        if (affected <= 0) throw new NotFoundException("Exercício não encontrado com o ID informado.");
    }

    public void excluir(UUID exercicioId) throws Exception {
        int affected = repository.excluir(exercicioId);
        if (affected <= 0) throw new NotFoundException("Exercício não encontrado com o ID informado.");
    }

    public Exercicio obter(UUID exercicioId) throws Exception {
        Exercicio ex = repository.obter(exercicioId);
        if (ex == null) throw new NotFoundException("Exercício não encontrado com o ID informado.");
        return ex;
    }

    public List<Exercicio> obterLista(UUID unidadeOrganizacionalId, String nome, int skip, int top) throws Exception {
        return repository.obterLista(unidadeOrganizacionalId, nome, skip, top);
    }

    private void validarCampos(Exercicio ex, UUID ignoreId) throws Exception {
        List<ValidationError> errors = createErrorList();
        ex.setNome(ex.getNome() != null ? ex.getNome().trim() : "");

        if (ex.getUnidadeOrganizacionalId() == null) {
            addError(errors, "UnidadeOrganizacionalId", "Informe a unidade organizacional.");
        }

        if (ex.getNome().isBlank()) {
            addError(errors, "Nome", "Informe o nome do exercício.");
        } else if (ex.getUnidadeOrganizacionalId() != null &&
                   repository.validarDuplicidade(ex.getNome(), ex.getUnidadeOrganizacionalId(), ignoreId)) {
            addError(errors, "Nome", "Já existe um exercício cadastrado com este nome.");
        }

        if (!errors.isEmpty()) throw new ValidationException(errors);
    }
}