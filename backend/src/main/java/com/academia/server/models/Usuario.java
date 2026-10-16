package com.academia.server.models;

import java.util.UUID;

public class Usuario {
    private UUID usuarioId;
    private UUID unidadeOrganizacionalId;
    private String username = "";
    private String senha = "";
    private String confirmaSenha = "";
    private String nome = "";
    private PerfilUsuario perfil = PerfilUsuario.Normal;
    private boolean cadastroCompleto;
    private JornadaUsuario jornadaUsuario = JornadaUsuario.RegisterPage;

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
    public UUID getUnidadeOrganizacionalId() { return unidadeOrganizacionalId; }
    public void setUnidadeOrganizacionalId(UUID unidadeOrganizacionalId) { this.unidadeOrganizacionalId = unidadeOrganizacionalId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getConfirmaSenha() { return confirmaSenha; }
    public void setConfirmaSenha(String confirmaSenha) { this.confirmaSenha = confirmaSenha; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public PerfilUsuario getPerfil() { return perfil; }
    public void setPerfil(PerfilUsuario perfil) { this.perfil = perfil; }
    public boolean isCadastroCompleto() { return cadastroCompleto; }
    public void setCadastroCompleto(boolean cadastroCompleto) { this.cadastroCompleto = cadastroCompleto; }
    public JornadaUsuario getJornadaUsuario() { return jornadaUsuario; }
    public void setJornadaUsuario(JornadaUsuario jornadaUsuario) { this.jornadaUsuario = jornadaUsuario; }

    public static class UsuarioGetResponse {
        private UUID usuarioId;
        private String username;
        private String nome = "";
        private String nomeUnidadeOrganizacional;
        private boolean cadastroCompleto;
        private JornadaUsuario jornadaUsuario;

        public UUID getUsuarioId() { return usuarioId; }
        public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getNomeUnidadeOrganizacional() { return nomeUnidadeOrganizacional; }
        public void setNomeUnidadeOrganizacional(String nomeUnidadeOrganizacional) { this.nomeUnidadeOrganizacional = nomeUnidadeOrganizacional; }
        public boolean isCadastroCompleto() { return cadastroCompleto; }
        public void setCadastroCompleto(boolean cadastroCompleto) { this.cadastroCompleto = cadastroCompleto; }
        public JornadaUsuario getJornadaUsuario() { return jornadaUsuario; }
        public void setJornadaUsuario(JornadaUsuario jornadaUsuario) { this.jornadaUsuario = jornadaUsuario; }
    }

    public static class UsuarioPatchRequest {
        private String nome = "";
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
    }
}