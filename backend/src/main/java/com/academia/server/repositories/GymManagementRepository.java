package com.academia.server.repositories;

import com.academia.server.models.GymManagementModels.Aluno;
import com.academia.server.models.GymManagementModels.Instrutor;
import com.academia.server.models.GymManagementModels.Pagamento;
import com.academia.server.models.GymManagementModels.Plano;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class GymManagementRepository extends BaseRepository {
    public GymManagementRepository(DataSource dataSource) {
        super(dataSource);
    }

    public List<Aluno> listarAlunos(UUID unidadeId) throws SQLException {
        String sql = """
                SELECT aluno_id, nome, cpf, email, telefone, data_nascimento, situacao
                FROM aluno
                WHERE unidade_organizacional_id = ?
                ORDER BY nome;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, unidadeId);
            try (ResultSet rs = cmd.executeQuery()) {
                List<Aluno> items = new ArrayList<>();
                while (rs.next()) {
                    items.add(new Aluno(
                            getUuidNullable(rs, "aluno_id"),
                            rs.getString("nome"),
                            rs.getString("cpf"),
                            rs.getString("email"),
                            rs.getString("telefone"),
                            rs.getObject("data_nascimento", LocalDate.class),
                            rs.getString("situacao")));
                }
                return items;
            }
        }
    }

    public UUID criarAluno(UUID unidadeId, Aluno item) throws SQLException {
        UUID id = UUID.randomUUID();
        String sql = """
                INSERT INTO aluno
                    (aluno_id, unidade_organizacional_id, nome, cpf, email, telefone, data_nascimento, situacao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            setUuid(cmd, 2, unidadeId);
            cmd.setString(3, item.nome());
            cmd.setString(4, item.cpf());
            cmd.setString(5, item.email());
            cmd.setString(6, item.telefone());
            cmd.setObject(7, item.dataNascimento());
            cmd.setString(8, item.situacao());
            cmd.executeUpdate();
        }
        return id;
    }

    public int atualizarAluno(UUID unidadeId, UUID id, Aluno item) throws SQLException {
        String sql = """
                UPDATE aluno
                SET nome = ?, cpf = ?, email = ?, telefone = ?, data_nascimento = ?,
                    situacao = ?, inativado_por_atraso = FALSE
                WHERE aluno_id = ? AND unidade_organizacional_id = ?;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, item.nome());
            cmd.setString(2, item.cpf());
            cmd.setString(3, item.email());
            cmd.setString(4, item.telefone());
            cmd.setObject(5, item.dataNascimento());
            cmd.setString(6, item.situacao());
            setUuid(cmd, 7, id);
            setUuid(cmd, 8, unidadeId);
            return cmd.executeUpdate();
        }
    }

    public int excluirAluno(UUID unidadeId, UUID id) throws SQLException {
        return executarExclusao("DELETE FROM aluno WHERE aluno_id = ? AND unidade_organizacional_id = ?;",
                unidadeId, id);
    }

    public boolean alunoExiste(UUID unidadeId, UUID id) throws SQLException {
        return existe("SELECT 1 FROM aluno WHERE unidade_organizacional_id = ? AND aluno_id = ?;",
                unidadeId, id);
    }

    public boolean alunoCpfEmUso(UUID unidadeId, String cpf, UUID ignorarId) throws SQLException {
        String sql = """
                SELECT 1 FROM aluno
                WHERE unidade_organizacional_id = ? AND cpf = ? AND aluno_id <> ?
                LIMIT 1;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, unidadeId);
            cmd.setString(2, cpf);
            setUuid(cmd, 3, ignorarId);
            try (ResultSet rs = cmd.executeQuery()) {
                return rs.next();
            }
        }
    }

    public boolean alunoPossuiPagamentos(UUID unidadeId, UUID id) throws SQLException {
        return existe("""
                SELECT 1 FROM controle_pagamento
                WHERE unidade_organizacional_id = ? AND aluno_id = ?
                LIMIT 1;
                """, unidadeId, id);
    }

    public List<Plano> listarPlanos(UUID unidadeId) throws SQLException {
        String sql = """
                SELECT plano_id, nome, descricao, valor, duracao_dias, ativo
                FROM plano
                WHERE unidade_organizacional_id = ?
                ORDER BY nome;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, unidadeId);
            try (ResultSet rs = cmd.executeQuery()) {
                List<Plano> items = new ArrayList<>();
                while (rs.next()) {
                    items.add(new Plano(
                            getUuidNullable(rs, "plano_id"),
                            rs.getString("nome"),
                            rs.getString("descricao"),
                            rs.getBigDecimal("valor"),
                            rs.getInt("duracao_dias"),
                            rs.getBoolean("ativo")));
                }
                return items;
            }
        }
    }

    public UUID criarPlano(UUID unidadeId, Plano item) throws SQLException {
        UUID id = UUID.randomUUID();
        String sql = """
                INSERT INTO plano (plano_id, unidade_organizacional_id, nome, descricao, valor, duracao_dias, ativo)
                VALUES (?, ?, ?, ?, ?, ?, ?);
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            setUuid(cmd, 2, unidadeId);
            cmd.setString(3, item.nome());
            cmd.setString(4, item.descricao());
            cmd.setBigDecimal(5, item.valor());
            cmd.setInt(6, item.duracaoDias());
            cmd.setBoolean(7, item.ativo());
            cmd.executeUpdate();
        }
        return id;
    }

    public int atualizarPlano(UUID unidadeId, UUID id, Plano item) throws SQLException {
        String sql = """
                UPDATE plano
                SET nome = ?, descricao = ?, valor = ?, duracao_dias = ?, ativo = ?
                WHERE plano_id = ? AND unidade_organizacional_id = ?;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, item.nome());
            cmd.setString(2, item.descricao());
            cmd.setBigDecimal(3, item.valor());
            cmd.setInt(4, item.duracaoDias());
            cmd.setBoolean(5, item.ativo());
            setUuid(cmd, 6, id);
            setUuid(cmd, 7, unidadeId);
            return cmd.executeUpdate();
        }
    }

    public int excluirPlano(UUID unidadeId, UUID id) throws SQLException {
        return executarExclusao("DELETE FROM plano WHERE plano_id = ? AND unidade_organizacional_id = ?;",
                unidadeId, id);
    }

    public boolean planoExiste(UUID unidadeId, UUID id) throws SQLException {
        return existe("SELECT 1 FROM plano WHERE unidade_organizacional_id = ? AND plano_id = ?;",
                unidadeId, id);
    }

    public boolean instrutorExiste(UUID unidadeId, UUID id) throws SQLException {
        return existe("SELECT 1 FROM instrutor WHERE unidade_organizacional_id = ? AND instrutor_id = ?;",
                unidadeId, id);
    }

    public boolean planoPossuiPagamentos(UUID unidadeId, UUID id) throws SQLException {
        return existe("""
                SELECT 1 FROM controle_pagamento
                WHERE unidade_organizacional_id = ? AND plano_id = ?
                LIMIT 1;
                """, unidadeId, id);
    }

    public List<Instrutor> listarInstrutores(UUID unidadeId) throws SQLException {
        String sql = """
                SELECT instrutor_id, nome, cpf, email, telefone, especialidade, ativo
                FROM instrutor
                WHERE unidade_organizacional_id = ?
                ORDER BY nome;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, unidadeId);
            try (ResultSet rs = cmd.executeQuery()) {
                List<Instrutor> items = new ArrayList<>();
                while (rs.next()) {
                    items.add(new Instrutor(
                            getUuidNullable(rs, "instrutor_id"),
                            rs.getString("nome"),
                            rs.getString("cpf"),
                            rs.getString("email"),
                            rs.getString("telefone"),
                            rs.getString("especialidade"),
                            rs.getBoolean("ativo")));
                }
                return items;
            }
        }
    }

    public UUID criarInstrutor(UUID unidadeId, Instrutor item) throws SQLException {
        UUID id = UUID.randomUUID();
        String sql = """
                INSERT INTO instrutor
                    (instrutor_id, unidade_organizacional_id, nome, cpf, email, telefone, especialidade, ativo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            setUuid(cmd, 2, unidadeId);
            cmd.setString(3, item.nome());
            cmd.setString(4, item.cpf());
            cmd.setString(5, item.email());
            cmd.setString(6, item.telefone());
            cmd.setString(7, item.especialidade());
            cmd.setBoolean(8, item.ativo());
            cmd.executeUpdate();
        }
        return id;
    }

    public int atualizarInstrutor(UUID unidadeId, UUID id, Instrutor item) throws SQLException {
        String sql = """
                UPDATE instrutor
                SET nome = ?, cpf = ?, email = ?, telefone = ?, especialidade = ?, ativo = ?
                WHERE instrutor_id = ? AND unidade_organizacional_id = ?;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, item.nome());
            cmd.setString(2, item.cpf());
            cmd.setString(3, item.email());
            cmd.setString(4, item.telefone());
            cmd.setString(5, item.especialidade());
            cmd.setBoolean(6, item.ativo());
            setUuid(cmd, 7, id);
            setUuid(cmd, 8, unidadeId);
            return cmd.executeUpdate();
        }
    }

    public int excluirInstrutor(UUID unidadeId, UUID id) throws SQLException {
        return executarExclusao("DELETE FROM instrutor WHERE instrutor_id = ? AND unidade_organizacional_id = ?;",
                unidadeId, id);
    }

    public boolean instrutorCpfEmUso(UUID unidadeId, String cpf, UUID ignorarId) throws SQLException {
        String sql = """
                SELECT 1 FROM instrutor
                WHERE unidade_organizacional_id = ? AND cpf = ? AND instrutor_id <> ?
                LIMIT 1;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, unidadeId);
            cmd.setString(2, cpf);
            setUuid(cmd, 3, ignorarId);
            try (ResultSet rs = cmd.executeQuery()) {
                return rs.next();
            }
        }
    }

    public List<Pagamento> listarPagamentos(UUID unidadeId) throws SQLException {
        String sql = """
                SELECT cp.pagamento_id, cp.aluno_id, a.nome AS aluno_nome, cp.plano_id, p.nome AS plano_nome,
                       cp.valor, cp.data_vencimento, cp.data_pagamento, cp.situacao
                FROM controle_pagamento cp
                JOIN aluno a ON a.aluno_id = cp.aluno_id
                JOIN plano p ON p.plano_id = cp.plano_id
                WHERE cp.unidade_organizacional_id = ?
                ORDER BY cp.data_vencimento DESC, a.nome;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, unidadeId);
            try (ResultSet rs = cmd.executeQuery()) {
                List<Pagamento> items = new ArrayList<>();
                while (rs.next()) {
                    items.add(new Pagamento(
                            getUuidNullable(rs, "pagamento_id"),
                            getUuidNullable(rs, "aluno_id"),
                            rs.getString("aluno_nome"),
                            getUuidNullable(rs, "plano_id"),
                            rs.getString("plano_nome"),
                            rs.getBigDecimal("valor"),
                            rs.getObject("data_vencimento", LocalDate.class),
                            rs.getObject("data_pagamento", LocalDate.class),
                            rs.getString("situacao")));
                }
                return items;
            }
        }
    }

    public UUID criarPagamento(UUID unidadeId, Pagamento item) throws SQLException {
        UUID id = UUID.randomUUID();
        String sql = """
                INSERT INTO controle_pagamento
                    (pagamento_id, unidade_organizacional_id, aluno_id, plano_id, valor,
                     data_vencimento, data_pagamento, situacao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            setUuid(cmd, 2, unidadeId);
            setUuid(cmd, 3, item.alunoId());
            setUuid(cmd, 4, item.planoId());
            cmd.setBigDecimal(5, item.valor());
            cmd.setObject(6, item.dataVencimento());
            cmd.setObject(7, item.dataPagamento());
            cmd.setString(8, item.situacao());
            cmd.executeUpdate();
        }
        return id;
    }

    public int atualizarPagamento(UUID unidadeId, UUID id, Pagamento item) throws SQLException {
        String sql = """
                UPDATE controle_pagamento
                SET aluno_id = ?, plano_id = ?, valor = ?, data_vencimento = ?,
                    data_pagamento = ?, situacao = ?
                WHERE pagamento_id = ? AND unidade_organizacional_id = ?;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, item.alunoId());
            setUuid(cmd, 2, item.planoId());
            cmd.setBigDecimal(3, item.valor());
            cmd.setObject(4, item.dataVencimento());
            cmd.setObject(5, item.dataPagamento());
            cmd.setString(6, item.situacao());
            setUuid(cmd, 7, id);
            setUuid(cmd, 8, unidadeId);
            return cmd.executeUpdate();
        }
    }

    public int excluirPagamento(UUID unidadeId, UUID id) throws SQLException {
        return executarExclusao("DELETE FROM controle_pagamento WHERE pagamento_id = ? AND unidade_organizacional_id = ?;",
                unidadeId, id);
    }

    public boolean pagamentoExiste(UUID unidadeId, UUID id) throws SQLException {
        return existe("SELECT 1 FROM controle_pagamento WHERE unidade_organizacional_id = ? AND pagamento_id = ?;",
                unidadeId, id);
    }

    public void sincronizarSituacaoAlunos(UUID unidadeId) throws SQLException {
        String inativar = """
                UPDATE aluno
                SET situacao = 'INATIVO', inativado_por_atraso = TRUE
                WHERE unidade_organizacional_id = ? AND situacao = 'ATIVO' AND inativado_por_atraso = FALSE
                  AND EXISTS (
                    SELECT 1 FROM controle_pagamento cp
                    WHERE cp.aluno_id = aluno.aluno_id AND cp.unidade_organizacional_id = aluno.unidade_organizacional_id
                      AND cp.situacao = 'PENDENTE' AND cp.data_vencimento < CURRENT_DATE
                  );
                """;
        String reativar = """
                UPDATE aluno
                SET situacao = 'ATIVO', inativado_por_atraso = FALSE
                WHERE unidade_organizacional_id = ? AND inativado_por_atraso = TRUE
                  AND NOT EXISTS (
                    SELECT 1 FROM controle_pagamento cp
                    WHERE cp.aluno_id = aluno.aluno_id AND cp.unidade_organizacional_id = aluno.unidade_organizacional_id
                      AND cp.situacao = 'PENDENTE' AND cp.data_vencimento < CURRENT_DATE
                  );
                """;
        try (Connection conn = getConnection();
             PreparedStatement inativarCmd = conn.prepareStatement(inativar);
             PreparedStatement reativarCmd = conn.prepareStatement(reativar)) {
            setUuid(inativarCmd, 1, unidadeId);
            inativarCmd.executeUpdate();
            setUuid(reativarCmd, 1, unidadeId);
            reativarCmd.executeUpdate();
        }
    }

    private int executarExclusao(String sql, UUID unidadeId, UUID id) throws SQLException {
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            setUuid(cmd, 2, unidadeId);
            return cmd.executeUpdate();
        }
    }

    private boolean existe(String sql, UUID unidadeId, UUID id) throws SQLException {
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, unidadeId);
            setUuid(cmd, 2, id);
            try (ResultSet rs = cmd.executeQuery()) {
                return rs.next();
            }
        }
    }
}
