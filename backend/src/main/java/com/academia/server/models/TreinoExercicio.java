package com.academia.server.models;

import java.util.UUID;

public class TreinoExercicio {
    private UUID treinoExercicioId;
    private UUID treinoId;
    private UUID equipamentoId;
    private String equipamentoImagemUrl;
    private String nomeExercicio = "";
    private String gruposMusculares = "";
    private String series = "";
    private String carga = "";
    private boolean concluido;

    public UUID getTreinoExercicioId() { return treinoExercicioId; }
    public void setTreinoExercicioId(UUID treinoExercicioId) { this.treinoExercicioId = treinoExercicioId; }
    public UUID getTreinoId() { return treinoId; }
    public void setTreinoId(UUID treinoId) { this.treinoId = treinoId; }
    public UUID getEquipamentoId() { return equipamentoId; }
    public void setEquipamentoId(UUID equipamentoId) { this.equipamentoId = equipamentoId; }
    public String getEquipamentoImagemUrl() { return equipamentoImagemUrl; }
    public void setEquipamentoImagemUrl(String equipamentoImagemUrl) { this.equipamentoImagemUrl = equipamentoImagemUrl; }
    public String getNomeExercicio() { return nomeExercicio; }
    public void setNomeExercicio(String nomeExercicio) { this.nomeExercicio = nomeExercicio; }
    public String getGruposMusculares() { return gruposMusculares; }
    public void setGruposMusculares(String gruposMusculares) { this.gruposMusculares = gruposMusculares; }
    public String getSeries() { return series; }
    public void setSeries(String series) { this.series = series; }
    public String getCarga() { return carga; }
    public void setCarga(String carga) { this.carga = carga; }
    public boolean isConcluido() { return concluido; }
    public void setConcluido(boolean concluido) { this.concluido = concluido; }
}