package com.academia.server.models;

import java.util.UUID;

public class Auth {
    private String username = "";
    private String senha = "";
    private UUID unidadeOrganizacionalId;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public UUID getUnidadeOrganizacionalId() { return unidadeOrganizacionalId; }
    public void setUnidadeOrganizacionalId(UUID unidadeOrganizacionalId) { this.unidadeOrganizacionalId = unidadeOrganizacionalId; }

    public static class AuthForgot extends Auth {}

    public static class AuthVerify {
        private String code = "";
        private String username = "";
        private UUID unidadeOrganizacionalId;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public UUID getUnidadeOrganizacionalId() { return unidadeOrganizacionalId; }
        public void setUnidadeOrganizacionalId(UUID unidadeOrganizacionalId) { this.unidadeOrganizacionalId = unidadeOrganizacionalId; }
    }

    public static class AuthReset {
        private String codigoAcessoId = "";
        private String senha = "";
        private String confirmaSenha = "";

        public String getCodigoAcessoId() { return codigoAcessoId; }
        public void setCodigoAcessoId(String codigoAcessoId) { this.codigoAcessoId = codigoAcessoId; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
        public String getConfirmaSenha() { return confirmaSenha; }
        public void setConfirmaSenha(String confirmaSenha) { this.confirmaSenha = confirmaSenha; }
    }

    public static class AuthLoginResponse {
        private String token;
        private JornadaUsuario jornadaUsuario;
        private String message;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public JornadaUsuario getJornadaUsuario() { return jornadaUsuario; }
        public void setJornadaUsuario(JornadaUsuario jornadaUsuario) { this.jornadaUsuario = jornadaUsuario; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class AuthVerifyResponse {
        private String codigoResetId;
        private JornadaUsuario jornadaUsuario;
        private String message;

        public String getCodigoResetId() { return codigoResetId; }
        public void setCodigoResetId(String codigoResetId) { this.codigoResetId = codigoResetId; }
        public JornadaUsuario getJornadaUsuario() { return jornadaUsuario; }
        public void setJornadaUsuario(JornadaUsuario jornadaUsuario) { this.jornadaUsuario = jornadaUsuario; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}