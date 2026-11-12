package com.academia.server.repositories;

import com.academia.server.models.Treino;
import com.academia.server.models.TreinoExercicio;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class TreinoRepository extends BaseRepository {

    public TreinoRepository(DataSource dataSource) {
        super(dataSource);
    }

    public UUID cadastrarTreino(Treino treino) throws SQLException {
        String sqlTreino = "INSERT INTO treino (unidade_organizacional_id, usuario_id, dia_semana, titulo) VALUES (?, ?, ?, ?) RETURNING treino_id;";
        String sqlExercicio = "INSERT INTO treino_exercicio (treino_id, exercicio_id, series, repeticoes, tempo_descanso, concluido) VALUES (?, ?, ?, ?, ?, ?);";

        Connection conn = null;
        try {
            conn = getConnection();
            conn.setAutoCommit(false);

            UUID treinoId = null;
            try (PreparedStatement cmd = conn.prepareStatement(sqlTreino)) {
                cmd.setObject(1, treino.getUnidadeOrganizacionalId());
                cmd.setObject(2, treino.getUsuarioId());
                cmd.setString(3, treino.getDiaSemana());
                cmd.setString(4, treino.getTitulo());
                try (ResultSet rs = cmd.executeQuery()) {
                    if (rs.next()) treinoId = getUuidNullable(rs, "treino_id");
                }
            }

            if (treinoId != null && treino.getExercicios() != null && !treino.getExercicios().isEmpty()) {
                try (PreparedStatement cmdEx = conn.prepareStatement(sqlExercicio)) {
                    for (TreinoExercicio ex : treino.getExercicios()) {
                        cmdEx.setObject(1, treinoId);
                        cmdEx.setObject(2, ex.getExercicioId());
                        cmdEx.setString(3, ex.getSeries());
                        cmdEx.setString(4, ex.getRepeticoes());
                        cmdEx.setString(5, ex.getTempoDescanso());
                        cmdEx.setBoolean(6, ex.isConcluido());
                        cmdEx.addBatch();
                    }
                    cmdEx.executeBatch();
                }
            }

            conn.commit();
            return treinoId;
        } catch (SQLException e) {
            if (conn != null) conn.rollback();
            throw e;
        } finally {
            if (conn != null) {
                conn.setAutoCommit(true);
                conn.close();
            }
        }
    }

    public int atualizarTreino(Treino treino, UUID treinoId) throws SQLException {
        String sqlUpdate = "UPDATE treino SET dia_semana = ?, titulo = ? WHERE treino_id = ?;";
        String sqlDeleteEx = "DELETE FROM treino_exercicio WHERE treino_id = ?;";
        String sqlInsertEx = "INSERT INTO treino_exercicio (treino_id, exercicio_id, series, repeticoes, tempo_descanso, concluido) VALUES (?, ?, ?, ?, ?, ?);";

        Connection conn = null;
        try {
            conn = getConnection();
            conn.setAutoCommit(false);

            int affected;
            try (PreparedStatement cmd = conn.prepareStatement(sqlUpdate)) {
                cmd.setString(1, treino.getDiaSemana());
                cmd.setString(2, treino.getTitulo());
                cmd.setObject(3, treinoId);
                affected = cmd.executeUpdate();
            }

            if (affected > 0) {
                try (PreparedStatement cmdDel = conn.prepareStatement(sqlDeleteEx)) {
                    cmdDel.setObject(1, treinoId);
                    cmdDel.executeUpdate();
                }

                if (treino.getExercicios() != null && !treino.getExercicios().isEmpty()) {
                    try (PreparedStatement cmdEx = conn.prepareStatement(sqlInsertEx)) {
                        for (TreinoExercicio ex : treino.getExercicios()) {
                            cmdEx.setObject(1, treinoId);
                            cmdEx.setObject(2, ex.getExercicioId());
                            cmdEx.setString(3, ex.getSeries());
                            cmdEx.setString(4, ex.getRepeticoes());
                            cmdEx.setString(5, ex.getTempoDescanso());
                            cmdEx.setBoolean(6, ex.isConcluido());
                            cmdEx.addBatch();
                        }
                        cmdEx.executeBatch();
                    }
                }
            }

            conn.commit();
            return affected;
        } catch (SQLException e) {
            if (conn != null) conn.rollback();
            throw e;
        } finally {
            if (conn != null) {
                conn.setAutoCommit(true);
                conn.close();
            }
        }
    }

    public Treino obterPorId(UUID treinoId) throws SQLException {
        String sql = "SELECT treino_id, unidade_organizacional_id, usuario_id, dia_semana, titulo FROM treino WHERE treino_id = ? LIMIT 1;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, treinoId);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) {
                    Treino t = new Treino();
                    t.setTreinoId(getUuidNullable(rs, "treino_id"));
                    t.setUnidadeOrganizacionalId(getUuidNullable(rs, "unidade_organizacional_id"));
                    t.setUsuarioId(getUuidNullable(rs, "usuario_id"));
                    t.setDiaSemana(rs.getString("dia_semana"));
                    t.setTitulo(rs.getString("titulo"));
                    t.setExercicios(obterExerciciosDoTreino(t.getTreinoId(), conn));
                    return t;
                }
            }
        }
        return null;
    }

    public List<Treino> obterTreinosDoUsuario(UUID usuarioId) throws SQLException {
        List<Treino> treinos = new ArrayList<>();
        String sqlTreino = "SELECT treino_id, unidade_organizacional_id, usuario_id, dia_semana, titulo FROM treino WHERE usuario_id = ? ORDER BY treino_id ASC;";

        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sqlTreino)) {
            cmd.setObject(1, usuarioId);
            try (ResultSet rs = cmd.executeQuery()) {
                while (rs.next()) {
                    Treino t = new Treino();
                    t.setTreinoId(getUuidNullable(rs, "treino_id"));
                    t.setUnidadeOrganizacionalId(getUuidNullable(rs, "unidade_organizacional_id"));
                    t.setUsuarioId(getUuidNullable(rs, "usuario_id"));
                    t.setDiaSemana(rs.getString("dia_semana"));
                    t.setTitulo(rs.getString("titulo"));
                    t.setExercicios(obterExerciciosDoTreino(t.getTreinoId(), conn));
                    treinos.add(t);
                }
            }
        }
        return treinos;
    }

    private List<TreinoExercicio> obterExerciciosDoTreino(UUID treinoId, Connection conn) throws SQLException {
        List<TreinoExercicio> exercicios = new ArrayList<>();
        String sql = """
            SELECT t.treino_exercicio_id, t.treino_id, t.exercicio_id, e.nome, e.arquivo_url,
                   t.series, t.repeticoes, t.tempo_descanso, t.concluido
            FROM treino_exercicio t
            INNER JOIN exercicio e ON t.exercicio_id = e.exercicio_id
            WHERE t.treino_id = ? ORDER BY t.treino_exercicio_id ASC;
        """;
        try (PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, treinoId);
            try (ResultSet rs = cmd.executeQuery()) {
                while (rs.next()) {
                    TreinoExercicio ex = new TreinoExercicio();
                    ex.setTreinoExercicioId(getUuidNullable(rs, "treino_exercicio_id"));
                    ex.setTreinoId(getUuidNullable(rs, "treino_id"));
                    ex.setExercicioId(getUuidNullable(rs, "exercicio_id"));
                    ex.setNomeExercicio(rs.getString("nome"));
                    ex.setArquivoUrl(rs.getString("arquivo_url"));
                    ex.setSeries(rs.getString("series"));
                    ex.setRepeticoes(rs.getString("repeticoes"));
                    ex.setTempoDescanso(rs.getString("tempo_descanso"));
                    ex.setConcluido(rs.getBoolean("concluido"));
                    exercicios.add(ex);
                }
            }
        }
        return exercicios;
    }

    public void atualizarStatusExercicio(UUID exercicioId, boolean concluido) throws SQLException {
        String sql = "UPDATE treino_exercicio SET concluido = ? WHERE treino_exercicio_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setBoolean(1, concluido);
            cmd.setObject(2, exercicioId);
            cmd.executeUpdate();
        }
    }

    public int excluirTreino(UUID treinoId) throws SQLException {
        String sql = "DELETE FROM treino WHERE treino_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, treinoId);
            return cmd.executeUpdate();
        }
    }
}