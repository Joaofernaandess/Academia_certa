-- docker run --name academia_certa -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=academia_certa -p 5432:5432 -d postgres:latest

CREATE SCHEMA IF NOT EXISTS academia_certa;

CREATE TABLE IF NOT EXISTS academia_certa.unidade_organizacional (
    unidade_organizacional_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matriz_id UUID,
    cnpj VARCHAR(14) NOT NULL,
    razao_social VARCHAR(100) NOT NULL,
    nome_fantasia VARCHAR(100),
    cep VARCHAR(8),
    endereco VARCHAR(100),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    pais VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(12),
    aprovado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS academia_certa.usuario (
    usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_organizacional_id UUID NOT NULL,
    username VARCHAR(12) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    perfil INTEGER NOT NULL,
    cadastro_completo BOOLEAN NOT NULL DEFAULT FALSE,
    jornada_usuario INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT uk_usuario_username_unidade UNIQUE (username, unidade_organizacional_id),
    CONSTRAINT fk_usuario_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES academia_certa.unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS academia_certa.codigo_acesso (
    usuario_id UUID NOT NULL REFERENCES academia_certa.usuario(usuario_id) ON DELETE CASCADE,
    codigo VARCHAR(6) NOT NULL,
    data_solicitacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_validacao TIMESTAMP NULL,
    utilizado BOOLEAN NOT NULL DEFAULT FALSE,
    codigo_reset_id VARCHAR(100) NULL,
    data_reset_id TIMESTAMP NULL,
    reset_efetuado BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (usuario_id, codigo, data_solicitacao)
);

INSERT INTO academia_certa.unidade_organizacional (cnpj, razao_social, nome_fantasia, telefone, aprovado)
VALUES ('60935686000134', 'Academia Faculdade Ltda', 'Academia Fit Campus', '37999999999', true);