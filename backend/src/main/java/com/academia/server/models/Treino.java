package com.academia.server.models;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Treino {
    private UUID treinoId;
    private UUID unidadeOrganizacionalId;
    private UUID usuarioId;
    private String diaSemana = "";
    private String titulo = "";
    private List<TreinoExercicio> exercicios = new ArrayList<>();

    public UUID getTreinoId() { return treinoId; }
    public void setTreinoId(UUID treinoId) { this.treinoId = treinoId; }
    public UUID getUnidadeOrganizacionalId() { return unidadeOrganizacionalId; }
    public void setUnidadeOrganizacionalId(UUID unidadeOrganizacionalId) { this.unidadeOrganizacionalId = unidadeOrganizacionalId; }
    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
    public String getDiaSemana() { return diaSemana; }
    public void setDiaSemana(String diaSemana) { this.diaSemana = diaSemana; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public List<TreinoExercicio> getExercicios() { return exercicios; }
    public void setExercicios(List<TreinoExercicio> exercicios) { this.exercicios = exercicios; }
    
    public static class AlternarStatusRequest {
        private boolean concluido;
        public boolean isConcluido() { return concluido; }
        public void setConcluido(boolean concluido) { this.concluido = concluido; }
    }
}