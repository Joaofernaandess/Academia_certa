package com.academia.server.repositories;

import com.academia.server.models.Exercicio;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class ExercicioRepository extends BaseRepository {

    public ExercicioRepository(DataSource dataSource) {
        super(dataSource);
    }

    public UUID cadastrar(Exercicio ex) throws SQLException {
        String sql = """
            INSERT INTO exercicio (unidade_organizacional_id, nome, descricao, arquivo_url, ativo)
            VALUES (?, ?, ?, ?, true)
            RETURNING exercicio_id;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, ex.getUnidadeOrganizacionalId());
            cmd.setString(2, ex.getNome());
            cmd.setString(3, ex.getDescricao());
            cmd.setString(4, ex.getArquivoUrl());
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return getUuidNullable(rs, "exercicio_id");
            }
        }
        return null;
    }

    public int atualizar(Exercicio ex, UUID exercicioId) throws SQLException {
        String sql = """
            UPDATE exercicio
            SET nome = ?, descricao = ?, arquivo_url = ?
            WHERE exercicio_id = ?;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, ex.getNome());
            cmd.setString(2, ex.getDescricao());
            cmd.setString(3, ex.getArquivoUrl());
            cmd.setObject(4, exercicioId);
            return cmd.executeUpdate();
        }
    }

    public int excluir(UUID exercicioId) throws SQLException {
        String sql = "DELETE FROM exercicio WHERE exercicio_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, exercicioId);
            return cmd.executeUpdate();
        }
    }

    public Exercicio obter(UUID exercicioId) throws SQLException {
        String sql = """
            SELECT exercicio_id, unidade_organizacional_id, nome, descricao, arquivo_url, ativo
            FROM exercicio
            WHERE exercicio_id = ?
            LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, exercicioId);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return mapExercicio(rs);
            }
        }
        return null;
    }

    public List<Exercicio> obterLista(UUID unidadeOrganizacionalId, String nome, int skip, int top) throws SQLException {
        List<Exercicio> lista = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT exercicio_id, unidade_organizacional_id, nome, descricao, arquivo_url, ativo
            FROM exercicio
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
                while (rs.next()) lista.add(mapExercicio(rs));
            }
        }
        return lista;
    }

    public boolean validarDuplicidade(String nome, UUID unidadeOrganizacionalId, UUID ignoreId) throws SQLException {
        String sql = """
            SELECT 1 FROM exercicio
            WHERE LOWER(BTRIM(nome)) = LOWER(BTRIM(?))
              AND unidade_organizacional_id = ?
              AND exercicio_id <> ?
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

    private Exercicio mapExercicio(ResultSet rs) throws SQLException {
        Exercicio e = new Exercicio();
        e.setExercicioId(getUuidNullable(rs, "exercicio_id"));
        e.setUnidadeOrganizacionalId(getUuidNullable(rs, "unidade_organizacional_id"));
        e.setNome(rs.getString("nome"));
        e.setDescricao(rs.getString("descricao"));
        e.setArquivoUrl(rs.getString("arquivo_url"));
        e.setAtivo(rs.getBoolean("ativo"));
        return e;
    }
}