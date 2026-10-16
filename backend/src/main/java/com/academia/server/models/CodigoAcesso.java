package com.academia.server.models;

import java.time.LocalDateTime;
import java.util.UUID;

public class CodigoAcesso {
    private UUID usuarioId;
    private String codigo = "";
    private LocalDateTime dataSolicitacao;
    private LocalDateTime dataValidacao;
    private boolean utilizado;
    private String codigoResetId;
    private LocalDateTime dataResetId;
    private boolean resetEfetuado;

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public LocalDateTime getDataSolicitacao() { return dataSolicitacao; }
    public void setDataSolicitacao(LocalDateTime dataSolicitacao) { this.dataSolicitacao = dataSolicitacao; }
    public LocalDateTime getDataValidacao() { return dataValidacao; }
    public void setDataValidacao(LocalDateTime dataValidacao) { this.dataValidacao = dataValidacao; }
    public boolean isUtilizado() { return utilizado; }
    public void setUtilizado(boolean utilizado) { this.utilizado = utilizado; }
    public String getCodigoResetId() { return codigoResetId; }
    public void setCodigoResetId(String codigoResetId) { this.codigoResetId = codigoResetId; }
    public LocalDateTime getDataResetId() { return dataResetId; }
    public void setDataResetId(LocalDateTime dataResetId) { this.dataResetId = dataResetId; }
    public boolean isResetEfetuado() { return resetEfetuado; }
    public void setResetEfetuado(boolean resetEfetuado) { this.resetEfetuado = resetEfetuado; }
}