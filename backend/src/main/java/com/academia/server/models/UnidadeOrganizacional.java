package com.academia.server.models;

import java.util.UUID;

public class UnidadeOrganizacional {
    private UUID unidadeOrganizacionalId;
    private UUID matrizId;
    private String cnpj = "";
    private String razaoSocial = "";
    private String nomeFantasia = "";
    private String cep = "";
    private String endereco = "";
    private String numero = "";
    private String complemento = "";
    private String bairro = "";
    private String cidade = "";
    private String uf = "";
    private String pais = "";
    private String email = "";
    private String telefone = "";
    private boolean aprovado;

    public UUID getUnidadeOrganizacionalId() { return unidadeOrganizacionalId; }
    public void setUnidadeOrganizacionalId(UUID unidadeOrganizacionalId) { this.unidadeOrganizacionalId = unidadeOrganizacionalId; }
    public UUID getMatrizId() { return matrizId; }
    public void setMatrizId(UUID matrizId) { this.matrizId = matrizId; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }
    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }
    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public boolean isAprovado() { return aprovado; }
    public void setAprovado(boolean aprovado) { this.aprovado = aprovado; }
}