package com.academia.server.repositories;

import com.academia.server.models.Equipamento;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class EquipamentoRepository extends BaseRepository {

    public EquipamentoRepository(DataSource dataSource) {
        super(dataSource);
    }

    public UUID cadastrar(Equipamento eq) throws SQLException {
        String sql = """
            INSERT INTO equipamento (unidade_organizacional_id, nome, grupo_muscular, imagem_url, ativo)
            VALUES (?, ?, ?, ?, true)
            RETURNING equipamento_id;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, eq.getUnidadeOrganizacionalId());
            cmd.setString(2, eq.getNome());
            cmd.setString(3, eq.getGrupoMuscular());
            cmd.setString(4, eq.getImagemUrl());
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return getUuidNullable(rs, "equipamento_id");
            }
        }
        return null;
    }

    public int atualizar(Equipamento eq, UUID equipamentoId) throws SQLException {
        String sql = """
            UPDATE equipamento
            SET nome = ?, grupo_muscular = ?, imagem_url = ?
            WHERE equipamento_id = ?;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, eq.getNome());
            cmd.setString(2, eq.getGrupoMuscular());
            cmd.setString(3, eq.getImagemUrl());
            cmd.setObject(4, equipamentoId);
            return cmd.executeUpdate();
        }
    }

    public int excluir(UUID equipamentoId) throws SQLException {
        String sql = "DELETE FROM equipamento WHERE equipamento_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, equipamentoId);
            return cmd.executeUpdate();
        }
    }

    public Equipamento obter(UUID equipamentoId) throws SQLException {
        String sql = """
            SELECT equipamento_id, unidade_organizacional_id, nome, grupo_muscular, imagem_url, ativo
            FROM equipamento WHERE equipamento_id = ? LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, equipamentoId);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return mapEquipamento(rs);
            }
        }
        return null;
    }

    public List<Equipamento> obterLista(UUID unidadeOrganizacionalId, String nome, int skip, int top) throws SQLException {
        List<Equipamento> lista = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT equipamento_id, unidade_organizacional_id, nome, grupo_muscular, imagem_url, ativo
            FROM equipamento
            WHERE ativo = true
        """);
        if (unidadeOrganizacionalId != null) sql.append(" AND unidade_organizacional_id = ?");
        if (nome != null && !nome.isBlank()) sql.append(" AND nome ILIKE ?");
        sql.append(" ORDER BY nome ASC LIMIT ? OFFSET ?;");

        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            if (unidadeOrganizacionalId != null) cmd.setObject(idx++, unidadeOrganizacionalId);
            if (nome != null && !nome.isBlank()) cmd.setString(idx++, "%" + nome.trim() + "%");
            cmd.setInt(idx++, top);
            cmd.setInt(idx, skip);

            try (ResultSet rs = cmd.executeQuery()) {
                while (rs.next()) lista.add(mapEquipamento(rs));
            }
        }
        return lista;
    }

    public boolean validarDuplicidade(String nome, UUID unidadeOrganizacionalId, UUID ignoreId) throws SQLException {
        String sql = """
            SELECT 1 FROM equipamento
            WHERE LOWER(BTRIM(nome)) = LOWER(BTRIM(?))
              AND unidade_organizacional_id = ?
              AND equipamento_id <> ?
            LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, nome);
            cmd.setObject(2, unidadeOrganizacionalId);
            cmd.setObject(3, ignoreId);
            try (ResultSet rs = cmd.executeQuery()) {
                return rs.next();
            }
        }
    }

    private Equipamento mapEquipamento(ResultSet rs) throws SQLException {
        Equipamento e = new Equipamento();
        e.setEquipamentoId(getUuidNullable(rs, "equipamento_id"));
        e.setUnidadeOrganizacionalId(getUuidNullable(rs, "unidade_organizacional_id"));
        e.setNome(rs.getString("nome"));
        e.setGrupoMuscular(rs.getString("grupo_muscular"));
        e.setImagemUrl(rs.getString("imagem_url"));
        e.setAtivo(rs.getBoolean("ativo"));
        return e;
    }
}