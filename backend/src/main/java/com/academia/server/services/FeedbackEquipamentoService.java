package com.academia.server.services;

import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.FeedbackEquipamento;
import com.academia.server.repositories.FeedbackEquipamentoRepository;
import com.academia.server.validations.ValidationError;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class FeedbackEquipamentoService extends BaseService {

    private final FeedbackEquipamentoRepository repository;

    public FeedbackEquipamentoService(FeedbackEquipamentoRepository repository) {
        this.repository = repository;
    }

    public UUID cadastrar(FeedbackEquipamento fb) throws Exception {
        List<ValidationError> errors = createErrorList();

        if (fb.getUnidadeOrganizacionalId() == null) {
            addError(errors, "UnidadeOrganizacionalId", "Informe a unidade organizacional.");
        }
        if (fb.getEquipamentoId() == null) {
            addError(errors, "EquipamentoId", "Selecione um equipamento.");
        }
        if (fb.getEstrelas() < 1 || fb.getEstrelas() > 5) {
            addError(errors, "Estrelas", "Selecione uma avaliação de 1 a 5 estrelas.");
        }
        if (fb.getComentario() == null || fb.getComentario().trim().isEmpty()) {
            addError(errors, "Comentario", "Deixe seu comentário ou feedback.");
        }

        if (!errors.isEmpty()) throw new ValidationException(errors);

        return repository.cadastrar(fb);
    }

    public List<FeedbackEquipamento> obterLista(UUID unidadeOrganizacionalId, UUID equipamentoId, int skip, int top) throws Exception {
        return repository.obterLista(unidadeOrganizacionalId, equipamentoId, skip, top);
    }
}