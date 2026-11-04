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

    public List<Treino> obterTreinosDoUsuario(UUID usuarioId) throws SQLException {
        List<Treino> treinos = new ArrayList<>();
        String sqlTreino = "SELECT treino_id, unidade_organizacional_id, usuario_id, dia_semana, titulo FROM treino WHERE usuario_id = ?;";
        
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
            SELECT t.treino_exercicio_id, t.treino_id, t.equipamento_id, t.nome_exercicio, 
                   t.grupos_musculares, t.series, t.carga, t.concluido, e.imagem_url 
            FROM treino_exercicio t
            LEFT JOIN equipamento e ON t.equipamento_id = e.equipamento_id
            WHERE t.treino_id = ? ORDER BY t.treino_exercicio_id ASC;
        """;
        try (PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, treinoId);
            try (ResultSet rs = cmd.executeQuery()) {
                while (rs.next()) {
                    TreinoExercicio ex = new TreinoExercicio();
                    ex.setTreinoExercicioId(getUuidNullable(rs, "treino_exercicio_id"));
                    ex.setTreinoId(getUuidNullable(rs, "treino_id"));
                    ex.setEquipamentoId(getUuidNullable(rs, "equipamento_id"));
                    ex.setNomeExercicio(rs.getString("nome_exercicio"));
                    ex.setGruposMusculares(rs.getString("grupos_musculares"));
                    ex.setSeries(rs.getString("series"));
                    ex.setCarga(rs.getString("carga"));
                    ex.setConcluido(rs.getBoolean("concluido"));
                    ex.setEquipamentoImagemUrl(rs.getString("imagem_url"));
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
}