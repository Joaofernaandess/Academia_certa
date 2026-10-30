package com.academia.server.models;

import java.util.UUID;

public class Equipamento {
    private UUID equipamentoId;
    private UUID unidadeOrganizacionalId;
    private String nome = "";
    private String grupoMuscular = "";
    private String imagemUrl = "";
    private boolean ativo = true;

    public UUID getEquipamentoId() { return equipamentoId; }
    public void setEquipamentoId(UUID equipamentoId) { this.equipamentoId = equipamentoId; }
    public UUID getUnidadeOrganizacionalId() { return unidadeOrganizacionalId; }
    public void setUnidadeOrganizacionalId(UUID unidadeOrganizacionalId) { this.unidadeOrganizacionalId = unidadeOrganizacionalId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getGrupoMuscular() { return grupoMuscular; }
    public void setGrupoMuscular(String grupoMuscular) { this.grupoMuscular = grupoMuscular; }
    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}