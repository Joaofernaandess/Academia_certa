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

-- 1. Tabela de Equipamentos da Academia (Ex: Crossover, Supino, Leg Press)
CREATE TABLE IF NOT EXISTS academia_certa.equipamento (
    equipamento_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_organizacional_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    grupo_muscular VARCHAR(100), -- Ex: "Peito, Ombro"
    imagem_url VARCHAR(500),     -- Link da foto ou vídeo do aparelho
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_equipamento_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES academia_certa.unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE
);

-- 2. Tabela de Feedback de Equipamentos (Imagem 1: Estrelas + Comentário)
CREATE TABLE IF NOT EXISTS academia_certa.feedback_equipamento (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_organizacional_id UUID NOT NULL,
    equipamento_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    estrelas INTEGER NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
    comentario VARCHAR(500),
    data_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_feedback_equipamento FOREIGN KEY (equipamento_id)
        REFERENCES academia_certa.equipamento (equipamento_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_usuario FOREIGN KEY (usuario_id)
        REFERENCES academia_certa.usuario (usuario_id) ON DELETE CASCADE
);

-- 3. Tabela de Treinos do Aluno (Imagem 2: "Segunda-feira - Peito e Tríceps")
CREATE TABLE IF NOT EXISTS academia_certa.treino (
    treino_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_organizacional_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    dia_semana VARCHAR(50) NOT NULL, -- Ex: "Segunda-feira"
    titulo VARCHAR(100) NOT NULL,    -- Ex: "Peito e Tríceps"
    CONSTRAINT fk_treino_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES academia_certa.unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE,
    CONSTRAINT fk_treino_usuario FOREIGN KEY (usuario_id)
        REFERENCES academia_certa.usuario (usuario_id) ON DELETE CASCADE
);

-- 4. Exercícios dentro do Treino (Imagem 2: Séries, Repetições, Carga e Checkbox Concluído)
CREATE TABLE IF NOT EXISTS academia_certa.treino_exercicio (
    treino_exercicio_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treino_id UUID NOT NULL,
    equipamento_id UUID,
    nome_exercicio VARCHAR(100) NOT NULL,  -- Ex: "Supino Reto"
    grupos_musculares VARCHAR(100),        -- Ex: "Peito, Tríceps"
    series VARCHAR(50) NOT NULL,           -- Ex: "4 séries x 10-12 reps"
    carga VARCHAR(30),                     -- Ex: "60kg"
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_exercicio_treino FOREIGN KEY (treino_id)
        REFERENCES academia_certa.treino (treino_id) ON DELETE CASCADE,
    CONSTRAINT fk_exercicio_equipamento FOREIGN KEY (equipamento_id)
        REFERENCES academia_certa.equipamento (equipamento_id) ON DELETE SET NULL
);


-- inserções iniciais do sistema --

INSERT INTO academia_certa.unidade_organizacional (cnpj, razao_social, nome_fantasia, telefone, aprovado)
VALUES ('60935686000134', 'Academia Faculdade Ltda', 'Academia Fit Campus', '37999999999', true);

INSERT INTO academia_certa.equipamento (unidade_organizacional_id, nome, grupo_muscular, imagem_url)
SELECT unidade_organizacional_id, 'Crossover (Polia)', 'Peito, Ombro', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'
FROM academia_certa.unidade_organizacional LIMIT 1;

INSERT INTO academia_certa.equipamento (unidade_organizacional_id, nome, grupo_muscular, imagem_url)
SELECT unidade_organizacional_id, 'Supino Reto', 'Peito, Tríceps', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80'
FROM academia_certa.unidade_organizacional LIMIT 1;

INSERT INTO academia_certa.equipamento (unidade_organizacional_id, nome, grupo_muscular, imagem_url)
SELECT unidade_organizacional_id, 'Tríceps Pulley', 'Tríceps', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80'
FROM academia_certa.unidade_organizacional LIMIT 1;