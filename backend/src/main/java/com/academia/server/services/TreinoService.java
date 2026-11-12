package com.academia.server.services;

import com.academia.server.exceptions.NotFoundException;
import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.Treino;
import com.academia.server.models.TreinoExercicio;
import com.academia.server.repositories.TreinoRepository;
import com.academia.server.validations.ValidationError;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TreinoService extends BaseService {

    private final TreinoRepository repository;

    public TreinoService(TreinoRepository repository) {
        this.repository = repository;
    }

    public UUID cadastrar(Treino treino) throws Exception {
        validarCampos(treino);
        return repository.cadastrarTreino(treino);
    }

    public void atualizar(Treino treino, UUID treinoId) throws Exception {
        validarCampos(treino);
        int affected = repository.atualizarTreino(treino, treinoId);
        if (affected <= 0) throw new NotFoundException("Ficha de treino não encontrada.");
    }
    
    public void excluir(UUID treinoId) throws Exception {
        int affected = repository.excluirTreino(treinoId);
        if (affected <= 0) throw new NotFoundException("Ficha de treino não encontrada.");
    }

    public Treino obterPorId(UUID treinoId) throws Exception {
        Treino t = repository.obterPorId(treinoId);
        if (t == null) throw new NotFoundException("Ficha de treino não encontrada.");
        return t;
    }

    public List<Treino> obterTreinosDoUsuario(UUID usuarioId) throws Exception {
        return repository.obterTreinosDoUsuario(usuarioId);
    }

    public void alternarConcluido(UUID exercicioId, boolean concluido) throws Exception {
        repository.atualizarStatusExercicio(exercicioId, concluido);
    }

    private void validarCampos(Treino treino) {
        List<ValidationError> errors = createErrorList();

        if (treino.getTitulo() == null || treino.getTitulo().isBlank()) {
            addError(errors, "Titulo", "Informe o título do treino.");
        }
        if (treino.getDiaSemana() == null || treino.getDiaSemana().isBlank()) {
            addError(errors, "DiaSemana", "Informe o dia da semana ou frequência.");
        }
        if (treino.getExercicios() == null || treino.getExercicios().isEmpty()) {
            addError(errors, "Exercicios", "Selecione pelo menos um exercício no combobox.");
        } else {
            for (TreinoExercicio ex : treino.getExercicios()) {
                if (ex.getSeries() == null || ex.getSeries().isBlank() ||
                    ex.getRepeticoes() == null || ex.getRepeticoes().isBlank()) {
                    addError(errors, "Exercicios", "Preencha as séries e repetições de todos os exercícios da lista.");
                    break;
                }
            }
        }

        if (!errors.isEmpty()) throw new ValidationException(errors);
    }
}