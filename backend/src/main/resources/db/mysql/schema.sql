CREATE DATABASE IF NOT EXISTS academia_certa
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE academia_certa;

CREATE TABLE IF NOT EXISTS unidade_organizacional (
    unidade_organizacional_id CHAR(36) NOT NULL,
    matriz_id CHAR(36) NULL,
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
    aprovado BOOLEAN NOT NULL DEFAULT FALSE,
    logo_mime_type VARCHAR(32) NULL,
    logo_data MEDIUMBLOB NULL,
    logo_atualizado_em DATETIME(6) NULL,
    PRIMARY KEY (unidade_organizacional_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario (
    usuario_id CHAR(36) NOT NULL,
    unidade_organizacional_id CHAR(36) NOT NULL,
    username VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    perfil INTEGER NOT NULL,
    cadastro_completo BOOLEAN NOT NULL DEFAULT FALSE,
    jornada_usuario INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (usuario_id),
    CONSTRAINT uk_usuario_username_unidade UNIQUE (username, unidade_organizacional_id),
    CONSTRAINT fk_usuario_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS codigo_acesso (
    usuario_id CHAR(36) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    data_solicitacao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    data_validacao DATETIME(6) NULL,
    utilizado BOOLEAN NOT NULL DEFAULT FALSE,
    codigo_reset_id VARCHAR(100) NULL,
    data_reset_id DATETIME(6) NULL,
    reset_efetuado BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (usuario_id, codigo, data_solicitacao),
    CONSTRAINT fk_codigo_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario (usuario_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS aluno (
    aluno_id CHAR(36) NOT NULL,
    unidade_organizacional_id CHAR(36) NOT NULL,
    nome VARCHAR(120) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(160) NOT NULL DEFAULT '',
    telefone VARCHAR(20) NOT NULL DEFAULT '',
    data_nascimento DATE NULL,
    situacao VARCHAR(10) NOT NULL DEFAULT 'ATIVO',
    inativado_por_atraso BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (aluno_id),
    CONSTRAINT uk_aluno_cpf_unidade UNIQUE (unidade_organizacional_id, cpf),
    CONSTRAINT uk_aluno_id_unidade UNIQUE (aluno_id, unidade_organizacional_id),
    CONSTRAINT fk_aluno_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS plano (
    plano_id CHAR(36) NOT NULL,
    unidade_organizacional_id CHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500) NOT NULL DEFAULT '',
    valor DECIMAL(10, 2) NOT NULL,
    duracao_dias INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (plano_id),
    CONSTRAINT uk_plano_id_unidade UNIQUE (plano_id, unidade_organizacional_id),
    CONSTRAINT fk_plano_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS instrutor (
    instrutor_id CHAR(36) NOT NULL,
    unidade_organizacional_id CHAR(36) NOT NULL,
    nome VARCHAR(120) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(160) NOT NULL DEFAULT '',
    telefone VARCHAR(20) NOT NULL DEFAULT '',
    especialidade VARCHAR(120) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (instrutor_id),
    CONSTRAINT uk_instrutor_cpf_unidade UNIQUE (unidade_organizacional_id, cpf),
    CONSTRAINT fk_instrutor_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS controle_pagamento (
    pagamento_id CHAR(36) NOT NULL,
    unidade_organizacional_id CHAR(36) NOT NULL,
    aluno_id CHAR(36) NOT NULL,
    plano_id CHAR(36) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE NULL,
    situacao VARCHAR(10) NOT NULL DEFAULT 'PENDENTE',
    PRIMARY KEY (pagamento_id),
    KEY ix_pagamento_vencimento (unidade_organizacional_id, situacao, data_vencimento),
    CONSTRAINT fk_pagamento_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE,
    CONSTRAINT fk_pagamento_aluno_unidade FOREIGN KEY (aluno_id, unidade_organizacional_id)
        REFERENCES aluno (aluno_id, unidade_organizacional_id),
    CONSTRAINT fk_pagamento_plano_unidade FOREIGN KEY (plano_id, unidade_organizacional_id)
        REFERENCES plano (plano_id, unidade_organizacional_id)
) ENGINE=InnoDB;
