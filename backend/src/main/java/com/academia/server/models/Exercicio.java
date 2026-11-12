package com.academia.server.models;

import java.util.UUID;

public class Exercicio {
    private UUID exercicioId;
    private UUID unidadeOrganizacionalId;
    private String nome = "";
    private String descricao = "";
    private String arquivoUrl = "";
    private boolean ativo = true;

    // Getters e Setters
    public UUID getExercicioId() { return exercicioId; }
    public void setExercicioId(UUID exercicioId) { this.exercicioId = exercicioId; }
    public UUID getUnidadeOrganizacionalId() { return unidadeOrganizacionalId; }
    public void setUnidadeOrganizacionalId(UUID unidadeOrganizacionalId) { this.unidadeOrganizacionalId = unidadeOrganizacionalId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getArquivoUrl() { return arquivoUrl; }
    public void setArquivoUrl(String arquivoUrl) { this.arquivoUrl = arquivoUrl; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}