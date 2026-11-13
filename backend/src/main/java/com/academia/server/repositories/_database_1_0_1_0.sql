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

-- 2. Usuários (perfil: 1 = Admin, 2 = Normal, 3 = Gestor)
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

-- 4. Tabela de Equipamentos da Academia (imagem_url em TEXT para suportar foto/Base64)
CREATE TABLE IF NOT EXISTS academia_certa.equipamento (
    equipamento_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_organizacional_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    grupo_muscular VARCHAR(100),
    imagem_url TEXT,
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

-- 6. Catálogo de Exercícios da Academia (arquivo_url em TEXT para suportar foto/GIF/vídeo Base64)
CREATE TABLE IF NOT EXISTS academia_certa.exercicio (
    exercicio_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_organizacional_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    arquivo_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_exercicio_unidade FOREIGN KEY (unidade_organizacional_id)
        REFERENCES academia_certa.unidade_organizacional (unidade_organizacional_id) ON DELETE CASCADE
);

-- 7. Tabela de Treinos do Aluno
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

-- 8. Exercícios dentro do Treino
CREATE TABLE IF NOT EXISTS academia_certa.treino_exercicio (
    treino_exercicio_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treino_id UUID NOT NULL,
    exercicio_id UUID NOT NULL,
    series VARCHAR(50),
    repeticoes VARCHAR(50),
    tempo_descanso VARCHAR(50),
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_exercicio_treino FOREIGN KEY (treino_id)
        REFERENCES academia_certa.treino (treino_id) ON DELETE CASCADE,
    CONSTRAINT fk_exercicio_base FOREIGN KEY (exercicio_id)
        REFERENCES academia_certa.exercicio (exercicio_id) ON DELETE CASCADE
);

-- ==========================================================
-- GARANTE QUE BANCOS JÁ EXISTENTES TENHAM AS COLUNAS EM TEXT
-- ==========================================================
ALTER TABLE academia_certa.equipamento ALTER COLUMN imagem_url TYPE TEXT;
ALTER TABLE academia_certa.exercicio ALTER COLUMN arquivo_url TYPE TEXT;


-- ==========================================================
-- INSERÇÃO DE DADOS INICIAIS 
-- ==========================================================

-- Cria a Unidade Organizacional Base caso ainda não exista
INSERT INTO academia_certa.unidade_organizacional (cnpj, razao_social, nome_fantasia, telefone, aprovado)
SELECT '60935686000134', 'Academia Faculdade Ltda', 'Academia Fit Campus', '37999999999', true
WHERE NOT EXISTS (SELECT 1 FROM academia_certa.unidade_organizacional WHERE cnpj = '60935686000134');


-- =================================================================================
-- MEGA SCRIPT DE POPULAÇÃO PARA APRESENTAÇÃO DA FACULDADE - ACADEMIA CERTA
-- Preserva sua Unidade Principal e seu Usuário Principal e popula TODAS as telas
-- =================================================================================

-- 0. Garante que as colunas de mídia suportem Base64 / URLs longas
ALTER TABLE academia_certa.equipamento ALTER COLUMN imagem_url TYPE TEXT;
ALTER TABLE academia_certa.exercicio ALTER COLUMN arquivo_url TYPE TEXT;

-- 1. Limpa dados anteriores de demonstração (sem apagar seu usuário principal)
DELETE FROM academia_certa.treino;
DELETE FROM academia_certa.feedback_equipamento;
DELETE FROM academia_certa.exercicio;
DELETE FROM academia_certa.equipamento;
DELETE FROM academia_certa.usuario 
WHERE username IN (
    '37999990001', '37999990002', '37999990003', '37999990004', '37999990005', '37999990006',
    '37988880001', '37988880002', '37988880003', '37988880004', '37988880005', '37988880006'
);
DELETE FROM academia_certa.unidade_organizacional 
WHERE cnpj IN ('11444777000161', '28538396000190', '45997418000153', '60746948000112');

-- 2. EMPRESAS PENDENTES DE APROVAÇÃO (Tela: Aprovar Empresas - aprovado = false)
INSERT INTO academia_certa.unidade_organizacional (cnpj, razao_social, nome_fantasia, telefone, email, cidade, uf, aprovado)
VALUES 
('11444777000161', 'Ironberg Centro de Treinamento Ltda', 'Ironberg CT Minas', '37999112233', 'contato@ironbergmg.com.br', 'Bom Despacho', 'MG', false),
('28538396000190', 'Smart Gym Fitness S.A.', 'Smart Gym Centro', '31988776655', 'expansao@smartgym.com.br', 'Belo Horizonte', 'MG', false),
('45997418000153', 'Arena mucleUp CrossFit & Musculação  Ltda', 'Arena Fit Performance', '37991234567', 'adm@arenafit.com.br', 'Divinópolis', 'MG', false),
('60746948000112', 'BioRitmo Saúde e Movimento Ltda', 'BioRitmo Club', '37997654321', 'gestao@bioritmoclub.com.br', 'Nova Serrana', 'MG', false);

-- 3. USUÁRIOS ATIVOS (Para as telas: Gerenciar Perfis e Atribuir Treino ao Aluno)
-- Senha padrão criptografada (BCrypt)
WITH uo AS (
    SELECT unidade_organizacional_id 
    FROM academia_certa.unidade_organizacional 
    WHERE aprovado = true 
    ORDER BY unidade_organizacional_id ASC 
    LIMIT 1
)
INSERT INTO academia_certa.usuario (unidade_organizacional_id, username, senha, nome, perfil, cadastro_completo, jornada_usuario)
SELECT unidade_organizacional_id, '37999990001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rafael Mendes (Personal)', 3, true, 4 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37999990002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Camila Rocha (Personal)', 3, true, 4 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37999990003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lucas Ferreira', 2, true, 4 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37999990004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mariana Costa', 2, true, 4 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37999990005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Gabriel Almeida', 2, true, 4 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37999990006', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Beatriz Martins', 2, true, 4 FROM uo;

-- 4. USUÁRIOS PENDENTES DE APROVAÇÃO (Tela: Aprovar Usuários - cadastro_completo = false, jornada_usuario = 3)
WITH uo AS (
    SELECT unidade_organizacional_id 
    FROM academia_certa.unidade_organizacional 
    WHERE aprovado = true 
    ORDER BY unidade_organizacional_id ASC 
    LIMIT 1
)
INSERT INTO academia_certa.usuario (unidade_organizacional_id, username, senha, nome, perfil, cadastro_completo, jornada_usuario)
SELECT unidade_organizacional_id, '37988880001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Henrique Oliveira', 2, false, 3 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37988880002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Fernanda Lima', 2, false, 3 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37988880003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Thiago Ribeiro', 2, false, 3 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37988880004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Juliana Santos', 2, false, 3 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37988880005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Matheus Carvalho', 2, false, 3 FROM uo UNION ALL
SELECT unidade_organizacional_id, '37988880006', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Larissa Gomes', 2, false, 3 FROM uo;

-- 5. EQUIPAMENTOS DA ACADEMIA (Tela: Equipamentos)
WITH uo AS (
    SELECT unidade_organizacional_id 
    FROM academia_certa.unidade_organizacional 
    WHERE aprovado = true 
    ORDER BY unidade_organizacional_id ASC 
    LIMIT 1
)
INSERT INTO academia_certa.equipamento (unidade_organizacional_id, nome, grupo_muscular, imagem_url, ativo)
SELECT unidade_organizacional_id, 'Crossover Duplo (Polia)', 'Peito, Ombro, Tríceps', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Banco de Supino Olímpico', 'Peito, Tríceps', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Leg Press 45º Linear', 'Quadríceps, Glúteos', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Cadeira Extensora Pro', 'Quadríceps', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Puxador Alto (Pulley Costas)', 'Costas, Bíceps', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Gaiola de Agachamento (Rack)', 'Pernas, Lombar', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Banco Scott (Rosca Bíceps)', 'Bíceps, Antebraço', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Esteira Ergométrica Pro Run', 'Cardio, Resistência', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=80', true FROM uo;

-- 6. CATÁLOGO DE EXERCÍCIOS (Tela: Exercícios)
WITH uo AS (
    SELECT unidade_organizacional_id 
    FROM academia_certa.unidade_organizacional 
    WHERE aprovado = true 
    ORDER BY unidade_organizacional_id ASC 
    LIMIT 1
)
INSERT INTO academia_certa.exercicio (unidade_organizacional_id, nome, descricao, arquivo_url, ativo)
SELECT unidade_organizacional_id, 'Supino Reto com Barra', 'Deite no banco, mantenha as escápulas retraídas, desça a barra até tocar o peito e empurre.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Crucifixo no Crossover', 'Incline levemente o tronco à frente e feche os braços contraindo o peitoral no centro.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Tríceps Pulley na Corda', 'Mantenha os cotovelos fixos ao lado do tronco e estenda o antebraço abrindo a corda no final.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Elevação Lateral com Halteres', 'Suba os halteres lateralmente até a linha dos ombros com leve flexão nos cotovelos.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Puxada Alta Aberta (Frente)', 'Puxe a barra em direção à parte superior do peito estufando o tórax e contraindo as dorsais.', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Remada Curvada Pronada', 'Incline o tronco a 45 graus, coluna neutra, e puxe a barra em direção ao umbigo.', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Rosca Direta no Banco Scott', 'Apoie os braços no banco Scott, desça controlando o peso e suba contraindo o bíceps.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Agachamento Livre na Gaiola', 'Pés na largura dos ombros, desça flexionando os joelhos até 90 graus mantendo o abdômen firme.', 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Leg Press 45º', 'Apoie os pés na plataforma e desça até formar 90 graus nos joelhos sem tirar o quadril do banco.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80', true FROM uo UNION ALL
SELECT unidade_organizacional_id, 'Cadeira Extensora Unilateral', 'Estenda totalmente os joelhos segurando 1 segundo no topo da contração do quadríceps.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80', true FROM uo;

-- 7. AVALIAÇÕES DE EQUIPAMENTOS (Telas: Equipamentos Avaliados + Histórico de Feedback)
WITH ref AS (
    SELECT 
        (SELECT unidade_organizacional_id FROM academia_certa.unidade_organizacional WHERE aprovado = true ORDER BY unidade_organizacional_id ASC LIMIT 1) AS uo_id,
        (SELECT usuario_id FROM academia_certa.usuario WHERE username = '37999990003' LIMIT 1) AS u_lucas,
        (SELECT usuario_id FROM academia_certa.usuario WHERE username = '37999990004' LIMIT 1) AS u_mariana,
        (SELECT usuario_id FROM academia_certa.usuario WHERE username = '37999990005' LIMIT 1) AS u_gabriel,
        (SELECT usuario_id FROM academia_certa.usuario WHERE username = '37999990006' LIMIT 1) AS u_beatriz,
        (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Cadeira Extensora Pro' LIMIT 1) AS eq_extensora,
        (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Esteira Ergométrica Pro Run' LIMIT 1) AS eq_esteira,
        (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Leg Press 45º Linear' LIMIT 1) AS eq_leg,
        (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Crossover Duplo (Polia)' LIMIT 1) AS eq_cross,
        (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Banco de Supino Olímpico' LIMIT 1) AS eq_supino,
        (SELECT equipamento_id FROM academia_certa.equipamento WHERE nome = 'Puxador Alto (Pulley Costas)' LIMIT 1) AS eq_pulley
)
INSERT INTO academia_certa.feedback_equipamento (unidade_organizacional_id, equipamento_id, usuario_id, estrelas, comentario, data_hora)
-- Cadeira Extensora Pro (Mais mal avaliada - Média ~1.8 para destacar no topo do Ranking de Manutenção)
SELECT uo_id, eq_extensora, u_lucas, 1, 'Estofado do apoio de canela está rasgado e machucando na execução.', NOW() - INTERVAL '4 hours' FROM ref UNION ALL
SELECT uo_id, eq_extensora, u_mariana, 2, 'Cabo de aço fazendo barulho estranho quando coloca mais de 50kg.', NOW() - INTERVAL '1 day' FROM ref UNION ALL
SELECT uo_id, eq_extensora, u_gabriel, 2, 'O pino seletor de carga está torto e difícil de encaixar.', NOW() - INTERVAL '2 days' FROM ref UNION ALL
SELECT uo_id, eq_extensora, u_beatriz, 2, 'Precisa de manutenção urgente no ajuste do encosto.', NOW() - INTERVAL '3 days' FROM ref UNION ALL

-- Esteira Ergométrica Pro Run (Média ~2.3)
SELECT uo_id, eq_esteira, u_mariana, 2, 'A lona dá pequenas travadas quando passa de 12 km/h.', NOW() - INTERVAL '6 hours' FROM ref UNION ALL
SELECT uo_id, eq_esteira, u_lucas, 3, 'Botão de inclinação está falhando às vezes.', NOW() - INTERVAL '2 days' FROM ref UNION ALL
SELECT uo_id, eq_esteira, u_beatriz, 2, 'Fazendo bastante ruído no motor.', NOW() - INTERVAL '4 days' FROM ref UNION ALL

-- Leg Press 45º Linear (Média ~3.5)
SELECT uo_id, eq_leg, u_gabriel, 4, 'Máquina muito firme, mas o trilho direito precisa de lubrificação.', NOW() - INTERVAL '12 hours' FROM ref UNION ALL
SELECT uo_id, eq_leg, u_lucas, 3, 'Trava de segurança um pouco dura.', NOW() - INTERVAL '3 days' FROM ref UNION ALL

-- Puxador Alto (Média ~4.3)
SELECT uo_id, eq_pulley, u_beatriz, 4, 'Roldanas bem leves, ótimo aparelho.', NOW() - INTERVAL '1 day' FROM ref UNION ALL
SELECT uo_id, eq_pulley, u_mariana, 5, 'Excelente ergonomia no apoio dos joelhos!', NOW() - INTERVAL '3 days' FROM ref UNION ALL
SELECT uo_id, eq_pulley, u_gabriel, 4, 'Muito bom, só a barra longa que está com a borracha gasta.', NOW() - INTERVAL '5 days' FROM ref UNION ALL

-- Crossover Duplo (Média ~4.8)
SELECT uo_id, eq_cross, u_lucas, 5, 'Melhor equipamento da academia! Cabos super macios.', NOW() - INTERVAL '2 hours' FROM ref UNION ALL
SELECT uo_id, eq_cross, u_mariana, 5, 'Regulagem de altura perfeita, não trava nada.', NOW() - INTERVAL '1 day' FROM ref UNION ALL
SELECT uo_id, eq_cross, u_gabriel, 5, 'Aparelho novo e muito versátil.', NOW() - INTERVAL '2 days' FROM ref UNION ALL
SELECT uo_id, eq_cross, u_beatriz, 4, 'Ótimo, mas costuma ter fila no horário de pico.', NOW() - INTERVAL '4 days' FROM ref UNION ALL

-- Banco de Supino Olímpico (Média 5.0)
SELECT uo_id, eq_supino, u_lucas, 5, 'Estofado firme e na largura oficial perfeita.', NOW() - INTERVAL '5 hours' FROM ref UNION ALL
SELECT uo_id, eq_supino, u_gabriel, 5, 'Suporte de barra com várias alturas, excelente segurança.', NOW() - INTERVAL '2 days' FROM ref;

-- 8. FICHAS DE TREINO COMPLETAS PARA O SEU USUÁRIO PRINCIPAL + ALUNOS
WITH usuario_principal AS (
    SELECT usuario_id, unidade_organizacional_id
    FROM academia_certa.usuario
    WHERE username NOT IN (
        '37999990001', '37999990002', '37999990003', '37999990004', '37999990005', '37999990006',
        '37988880001', '37988880002', '37988880003', '37988880004', '37988880005', '37988880006'
    )
    ORDER BY usuario_id ASC
    LIMIT 1
),
aluno_lucas AS (
    SELECT usuario_id, unidade_organizacional_id
    FROM academia_certa.usuario
    WHERE username = '37999990003'
    LIMIT 1
),
t_segunda AS (
    INSERT INTO academia_certa.treino (unidade_organizacional_id, usuario_id, dia_semana, titulo)
    SELECT unidade_organizacional_id, usuario_id, 'Segunda-feira', 'Peito, Ombro e Tríceps'
    FROM usuario_principal
    RETURNING treino_id
),
t_quarta AS (
    INSERT INTO academia_certa.treino (unidade_organizacional_id, usuario_id, dia_semana, titulo)
    SELECT unidade_organizacional_id, usuario_id, 'Quarta-feira', 'Costas e Bíceps'
    FROM usuario_principal
    RETURNING treino_id
),
t_sexta AS (
    INSERT INTO academia_certa.treino (unidade_organizacional_id, usuario_id, dia_semana, titulo)
    SELECT unidade_organizacional_id, usuario_id, 'Sexta-feira', 'Pernas Completo'
    FROM usuario_principal
    RETURNING treino_id
),
t_lucas_a AS (
    INSERT INTO academia_certa.treino (unidade_organizacional_id, usuario_id, dia_semana, titulo)
    SELECT unidade_organizacional_id, usuario_id, 'Treino A', 'Superiores Completo'
    FROM aluno_lucas
    RETURNING treino_id
)
INSERT INTO academia_certa.treino_exercicio (treino_id, exercicio_id, series, repeticoes, tempo_descanso, concluido)
-- Exercícios da Segunda-feira (Usuário Principal)
SELECT t.treino_id, e.exercicio_id, '4', '10-12', '60s', true FROM t_segunda t JOIN academia_certa.exercicio e ON e.nome = 'Supino Reto com Barra' UNION ALL
SELECT t.treino_id, e.exercicio_id, '3', '12', '45s', true FROM t_segunda t JOIN academia_certa.exercicio e ON e.nome = 'Crucifixo no Crossover' UNION ALL
SELECT t.treino_id, e.exercicio_id, '4', '12-15', '45s', false FROM t_segunda t JOIN academia_certa.exercicio e ON e.nome = 'Elevação Lateral com Halteres' UNION ALL
SELECT t.treino_id, e.exercicio_id, '4', '12', '45s', false FROM t_segunda t JOIN academia_certa.exercicio e ON e.nome = 'Tríceps Pulley na Corda' UNION ALL

-- Exercícios da Quarta-feira (Usuário Principal)
SELECT t.treino_id, e.exercicio_id, '4', '10-12', '60s', false FROM t_quarta t JOIN academia_certa.exercicio e ON e.nome = 'Puxada Alta Aberta (Frente)' UNION ALL
SELECT t.treino_id, e.exercicio_id, '4', '10', '60s', false FROM t_quarta t JOIN academia_certa.exercicio e ON e.nome = 'Remada Curvada Pronada' UNION ALL
SELECT t.treino_id, e.exercicio_id, '3', '12', '45s', false FROM t_quarta t JOIN academia_certa.exercicio e ON e.nome = 'Rosca Direta no Banco Scott' UNION ALL

-- Exercícios da Sexta-feira (Usuário Principal)
SELECT t.treino_id, e.exercicio_id, '4', '8-10', '90s', false FROM t_sexta t JOIN academia_certa.exercicio e ON e.nome = 'Agachamento Livre na Gaiola' UNION ALL
SELECT t.treino_id, e.exercicio_id, '4', '12', '75s', false FROM t_sexta t JOIN academia_certa.exercicio e ON e.nome = 'Leg Press 45º' UNION ALL
SELECT t.treino_id, e.exercicio_id, '4', '12-15', '60s', false FROM t_sexta t JOIN academia_certa.exercicio e ON e.nome = 'Cadeira Extensora Unilateral' UNION ALL

-- Exercícios do Aluno Lucas Ferreira (Para demonstrar a troca de aluno pelo Gestor/Admin)
SELECT t.treino_id, e.exercicio_id, '4', '10', '60s', true FROM t_lucas_a t JOIN academia_certa.exercicio e ON e.nome = 'Supino Reto com Barra' UNION ALL
SELECT t.treino_id, e.exercicio_id, '4', '12', '60s', false FROM t_lucas_a t JOIN academia_certa.exercicio e ON e.nome = 'Puxada Alta Aberta (Frente)' UNION ALL
SELECT t.treino_id, e.exercicio_id, '3', '12', '45s', false FROM t_lucas_a t JOIN academia_certa.exercicio e ON e.nome = 'Rosca Direta no Banco Scott';







-- 1. Limpa todos os dados operacionais (treinos, exercícios, equipamentos, feedbacks e códigos)
DELETE FROM academia_certa.treino_exercicio;
DELETE FROM academia_certa.treino;
DELETE FROM academia_certa.feedback_equipamento;
DELETE FROM academia_certa.exercicio;
DELETE FROM academia_certa.equipamento;
DELETE FROM academia_certa.codigo_acesso;

-- 2. Remove todos os outros usuários, mantendo apenas o seu usuário JV
DELETE FROM academia_certa.usuario
WHERE usuario_id NOT IN (
    SELECT usuario_id 
    FROM academia_certa.usuario 
    WHERE nome ILIKE '%JV%' OR nome ILIKE '%João%'
    ORDER BY usuario_id ASC
    LIMIT 1
);

-- 3. Remove todas as outras empresas/unidades, mantendo apenas a unidade do seu usuário
DELETE FROM academia_certa.unidade_organizacional
WHERE unidade_organizacional_id NOT IN (
    SELECT unidade_organizacional_id 
    FROM academia_certa.usuario
);