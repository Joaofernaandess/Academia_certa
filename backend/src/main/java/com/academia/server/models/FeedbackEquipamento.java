package com.academia.server.models;

import java.time.LocalDateTime;
import java.util.UUID;

public class FeedbackEquipamento {
    private UUID feedbackId;
    private UUID unidadeOrganizacionalId;
    private UUID equipamentoId;
    private String equipamentoNome;
    private String equipamentoImagemUrl;
    private UUID usuarioId;
    private String usuarioNome;
    private int estrelas;
    private String comentario = "";
    private LocalDateTime dataHora;

    public UUID getFeedbackId() { return feedbackId; }
    public void setFeedbackId(UUID feedbackId) { this.feedbackId = feedbackId; }
    public UUID getUnidadeOrganizacionalId() { return unidadeOrganizacionalId; }
    public void setUnidadeOrganizacionalId(UUID unidadeOrganizacionalId) { this.unidadeOrganizacionalId = unidadeOrganizacionalId; }
    public UUID getEquipamentoId() { return equipamentoId; }
    public void setEquipamentoId(UUID equipamentoId) { this.equipamentoId = equipamentoId; }
    public String getEquipamentoNome() { return equipamentoNome; }
    public void setEquipamentoNome(String equipamentoNome) { this.equipamentoNome = equipamentoNome; }
    public String getEquipamentoImagemUrl() { return equipamentoImagemUrl; }
    public void setEquipamentoImagemUrl(String equipamentoImagemUrl) { this.equipamentoImagemUrl = equipamentoImagemUrl; }
    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
    public String getUsuarioNome() { return usuarioNome; }
    public void setUsuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; }
    public int getEstrelas() { return estrelas; }
    public void setEstrelas(int estrelas) { this.estrelas = estrelas; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
}