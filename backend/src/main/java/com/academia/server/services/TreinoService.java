package com.academia.server.services;

import com.academia.server.models.Treino;
import com.academia.server.repositories.TreinoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TreinoService extends BaseService {

    private final TreinoRepository repository;

    public TreinoService(TreinoRepository repository) {
        this.repository = repository;
    }

    public List<Treino> obterTreinosDoUsuario(UUID usuarioId) throws Exception {
        return repository.obterTreinosDoUsuario(usuarioId);
    }

    public void alternarConcluido(UUID exercicioId, boolean concluido) throws Exception {
        repository.atualizarStatusExercicio(exercicioId, concluido);
    }
}