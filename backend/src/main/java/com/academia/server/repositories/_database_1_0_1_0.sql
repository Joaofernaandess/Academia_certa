-- docker run --name academia_certa -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=academia_certa -p 5434:5432 -d postgres:latest

CREATE SCHEMA IF NOT EXISTS academia_certa;

-- 1. Unidades Organizacionais
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

-- 2. Usuários
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

-- 3. Códigos de Acesso
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

-- 4. Tabela de Equipamentos da Academia
CREATE TABLE IF NOT EXISTS academia_certa.equipamento (
    equipamento_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_organizacional_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    grupo_muscular VARCHAR(100), 
    imagem_url VARCHAR(500),     
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_equipamento_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES academia_certa.unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE
);

-- 5. Tabela de Feedback de Equipamentos
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

-- 6. Tabela de Treinos do Aluno
CREATE TABLE IF NOT EXISTS academia_certa.treino (
    treino_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_organizacional_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    dia_semana VARCHAR(50) NOT NULL, 
    titulo VARCHAR(100) NOT NULL,    
    CONSTRAINT fk_treino_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES academia_certa.unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE,
    CONSTRAINT fk_treino_usuario FOREIGN KEY (usuario_id)
        REFERENCES academia_certa.usuario (usuario_id) ON DELETE CASCADE
);

-- 7. Exercícios dentro do Treino
CREATE TABLE IF NOT EXISTS academia_certa.treino_exercicio (
    treino_exercicio_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treino_id UUID NOT NULL,
    equipamento_id UUID,
    nome_exercicio VARCHAR(100) NOT NULL,  
    grupos_musculares VARCHAR(100),        
    series VARCHAR(50) NOT NULL,           
    carga VARCHAR(30),                     
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_exercicio_treino FOREIGN KEY (treino_id)
        REFERENCES academia_certa.treino (treino_id) ON DELETE CASCADE,
    CONSTRAINT fk_exercicio_equipamento FOREIGN KEY (equipamento_id)
        REFERENCES academia_certa.equipamento (equipamento_id) ON DELETE SET NULL
);

-- ==========================================================
-- INSERÇÕES INICIAIS DO SISTEMA (DADOS DE TESTE)
-- ==========================================================

-- A) Cria a Unidade Organizacional Base
INSERT INTO academia_certa.unidade_organizacional (cnpj, razao_social, nome_fantasia, telefone, aprovado)
SELECT '60935686000134', 'Academia Faculdade Ltda', 'Academia Fit Campus', '37999999999', true
WHERE NOT EXISTS (SELECT 1 FROM academia_certa.unidade_organizacional WHERE cnpj = '60935686000134');

-- B) Cria Usuários Falsos para Feedback (Alunos fictícios)
WITH uo AS (SELECT unidade_organizacional_id FROM academia_certa.unidade_organizacional LIMIT 1)
INSERT INTO academia_certa.usuario (unidade_organizacional_id, username, senha, nome, perfil, cadastro_completo, jornada_usuario)
SELECT unidade_organizacional_id, '11999990001', '123', 'Maria da Silva', 2, true, 4 FROM uo UNION ALL
SELECT unidade_organizacional_id, '11999990002', '123', 'Carlos Eduardo', 2, true, 4 FROM uo UNION ALL
SELECT unidade_organizacional_id, '11999990003', '123', 'Ana Beatriz', 2, true, 4 FROM uo UNION ALL
SELECT unidade_organizacional_id, '11999990004', '123', 'Pedro Souza', 2, true, 4 FROM uo;

-- C) Cria os Equipamentos Base
WITH uo AS (SELECT unidade_organizacional_id FROM academia_certa.unidade_organizacional LIMIT 1)
INSERT INTO academia_certa.equipamento (unidade_organizacional_id, nome, grupo_muscular, imagem_url)
SELECT unidade_organizacional_id, 'Crossover (Polia)', 'Peito, Ombro', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80' FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Supino Reto', 'Peito, Tríceps', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80' FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Tríceps Pulley', 'Tríceps', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80' FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Cadeira Extensora', 'Quadríceps', 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&w=900&q=80' FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Leg Press 45', 'Pernas', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80' FROM uo;

-- D) Popula dezenas de Feedbacks Variados (Usando os usuários criados acima e a própria conta de Admin)
WITH dados AS (
    SELECT u.unidade_organizacional_id, u.usuario_id, 
           (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Crossover (Polia)' LIMIT 1) AS crossover_id,
           (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Supino Reto' LIMIT 1) AS supino_id,
           (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Cadeira Extensora' LIMIT 1) AS extensora_id,
           (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Leg Press 45' LIMIT 1) AS leg_id
    FROM academia_certa.usuario u LIMIT 4
)
INSERT INTO academia_certa.feedback_equipamento (unidade_organizacional_id, equipamento_id, usuario_id, estrelas, comentario)
SELECT unidade_organizacional_id, crossover_id, usuario_id, 5, 'Melhor equipamento da academia, cabos muito lisos.' FROM dados UNION ALL
SELECT unidade_organizacional_id, crossover_id, usuario_id, 4, 'Muito bom, mas falta lubrificar a roldana da esquerda.' FROM dados UNION ALL
SELECT unidade_organizacional_id, crossover_id, usuario_id, 5, 'Excelente para fazer peito e ombro.' FROM dados UNION ALL
SELECT unidade_organizacional_id, crossover_id, usuario_id, 3, 'O pino de peso estava travando hoje de manhã.' FROM dados UNION ALL

SELECT unidade_organizacional_id, supino_id, usuario_id, 5, 'Banco ótimo, tecido novo.' FROM dados UNION ALL
SELECT unidade_organizacional_id, supino_id, usuario_id, 4, 'Legal, mas o suporte da barra podia ser mais alto.' FROM dados UNION ALL
SELECT unidade_organizacional_id, supino_id, usuario_id, 5, 'Perfeito!' FROM dados UNION ALL

SELECT unidade_organizacional_id, extensora_id, usuario_id, 2, 'Estofado rasgado, precisa trocar com urgência!' FROM dados UNION ALL
SELECT unidade_organizacional_id, extensora_id, usuario_id, 1, 'Péssimo. Máquina está torta.' FROM dados UNION ALL
SELECT unidade_organizacional_id, extensora_id, usuario_id, 2, 'Machuca muito a canela, acho que quebrou alguma coisa dentro.' FROM dados UNION ALL
SELECT unidade_organizacional_id, extensora_id, usuario_id, 3, 'Dá pro gasto.' FROM dados UNION ALL

SELECT unidade_organizacional_id, leg_id, usuario_id, 4, 'Aparelho firme, muito bom.' FROM dados UNION ALL
SELECT unidade_organizacional_id, leg_id, usuario_id, 2, 'O trilho está agarrando muito, favor lubrificar.' FROM dados;




-- 1. Limpa todos os Treinos (Os exercícios somem automaticamente via CASCADE)
DELETE FROM academia_certa.treino;

-- 2. Limpa todos os Equipamentos (Os feedbacks somem automaticamente via CASCADE)
DELETE FROM academia_certa.equipamento;

-- 3. Deleta APENAS os 4 usuários fictícios de teste (Maria, Carlos, Ana e Pedro)
DELETE FROM academia_certa.usuario 
WHERE username IN ('11999990001', '11999990002', '11999990003', '11999990004');