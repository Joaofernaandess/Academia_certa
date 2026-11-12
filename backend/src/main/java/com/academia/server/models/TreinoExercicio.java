package com.academia.server.models;

import java.util.UUID;

public class TreinoExercicio {
    private UUID treinoExercicioId;
    private UUID treinoId;
    private UUID exercicioId;
    private String nomeExercicio;
    private String arquivoUrl;
    private String series = "";
    private String repeticoes = "";
    private String tempoDescanso = "";
    private boolean concluido;

    // Getters e Setters
    public UUID getTreinoExercicioId() { return treinoExercicioId; }
    public void setTreinoExercicioId(UUID treinoExercicioId) { this.treinoExercicioId = treinoExercicioId; }
    public UUID getTreinoId() { return treinoId; }
    public void setTreinoId(UUID treinoId) { this.treinoId = treinoId; }
    public UUID getExercicioId() { return exercicioId; }
    public void setExercicioId(UUID exercicioId) { this.exercicioId = exercicioId; }
    public String getNomeExercicio() { return nomeExercicio; }
    public void setNomeExercicio(String nomeExercicio) { this.nomeExercicio = nomeExercicio; }
    public String getArquivoUrl() { return arquivoUrl; }
    public void setArquivoUrl(String arquivoUrl) { this.arquivoUrl = arquivoUrl; }
    public String getSeries() { return series; }
    public void setSeries(String series) { this.series = series; }
    public String getRepeticoes() { return repeticoes; }
    public void setRepeticoes(String repeticoes) { this.repeticoes = repeticoes; }
    public String getTempoDescanso() { return tempoDescanso; }
    public void setTempoDescanso(String tempoDescanso) { this.tempoDescanso = tempoDescanso; }
    public boolean isConcluido() { return concluido; }
    public void setConcluido(boolean concluido) { this.concluido = concluido; }
}