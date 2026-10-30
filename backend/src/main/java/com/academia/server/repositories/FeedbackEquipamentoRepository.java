package com.academia.server.repositories;

import com.academia.server.models.FeedbackEquipamento;
import com.academia.server.utils.DateTimeHelper;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class FeedbackEquipamentoRepository extends BaseRepository {

    public FeedbackEquipamentoRepository(DataSource dataSource) {
        super(dataSource);
    }

    public UUID cadastrar(FeedbackEquipamento fb) throws SQLException {
        String sql = """
            INSERT INTO feedback_equipamento (unidade_organizacional_id, equipamento_id, usuario_id, estrelas, comentario, data_hora)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING feedback_id;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, fb.getUnidadeOrganizacionalId());
            cmd.setObject(2, fb.getEquipamentoId());
            cmd.setObject(3, fb.getUsuarioId());
            cmd.setInt(4, fb.getEstrelas());
            cmd.setString(5, fb.getComentario());
            cmd.setTimestamp(6, Timestamp.valueOf(DateTimeHelper.saoPaulo()));
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return getUuidNullable(rs, "feedback_id");
            }
        }
        return null;
    }

    public List<FeedbackEquipamento> obterLista(UUID unidadeOrganizacionalId, UUID equipamentoId, int skip, int top) throws SQLException {
        List<FeedbackEquipamento> lista = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT f.feedback_id, f.unidade_organizacional_id, f.equipamento_id,
                   e.nome AS equipamento_nome, e.imagem_url AS equipamento_imagem_url,
                   f.usuario_id, u.nome AS usuario_nome,
                   f.estrelas, f.comentario, f.data_hora
            FROM feedback_equipamento f
            INNER JOIN equipamento e ON f.equipamento_id = e.equipamento_id
            LEFT JOIN usuario u ON f.usuario_id = u.usuario_id
            WHERE 1 = 1
        """);
        if (unidadeOrganizacionalId != null) sql.append(" AND f.unidade_organizacional_id = ?");
        if (equipamentoId != null) sql.append(" AND f.equipamento_id = ?");
        sql.append(" ORDER BY f.data_hora DESC LIMIT ? OFFSET ?;");

        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            if (unidadeOrganizacionalId != null) cmd.setObject(idx++, unidadeOrganizacionalId);
            if (equipamentoId != null) cmd.setObject(idx++, equipamentoId);
            cmd.setInt(idx++, top);
            cmd.setInt(idx, skip);

            try (ResultSet rs = cmd.executeQuery()) {
                while (rs.next()) {
                    FeedbackEquipamento f = new FeedbackEquipamento();
                    f.setFeedbackId(getUuidNullable(rs, "feedback_id"));
                    f.setUnidadeOrganizacionalId(getUuidNullable(rs, "unidade_organizacional_id"));
                    f.setEquipamentoId(getUuidNullable(rs, "equipamento_id"));
                    f.setEquipamentoNome(rs.getString("equipamento_nome"));
                    f.setEquipamentoImagemUrl(rs.getString("equipamento_imagem_url"));
                    f.setUsuarioId(getUuidNullable(rs, "usuario_id"));
                    f.setUsuarioNome(rs.getString("usuario_nome"));
                    f.setEstrelas(rs.getInt("estrelas"));
                    f.setComentario(rs.getString("comentario"));
                    f.setDataHora(getDateTimeNullable(rs, "data_hora"));
                    lista.add(f);
                }
            }
        }
        return lista;
    }
}