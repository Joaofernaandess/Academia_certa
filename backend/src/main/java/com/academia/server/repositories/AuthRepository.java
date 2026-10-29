package com.academia.server.repositories;

import com.academia.server.models.CodigoAcesso;
import com.academia.server.models.JornadaUsuario;
import com.academia.server.models.PerfilUsuario;
import com.academia.server.models.Usuario;
import com.academia.server.utils.DateTimeHelper;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public class AuthRepository extends BaseRepository {

    public AuthRepository(DataSource dataSource) {
        super(dataSource);
    }

    public Usuario obterUsername(String username, UUID unidadeOrganizacionalId) throws SQLException {
        String sql = """
            SELECT usuario_id, username, senha, nome, perfil, unidade_organizacional_id, cadastro_completo, jornada_usuario
            FROM usuario
            WHERE username = ? AND unidade_organizacional_id = ?
            LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, username);
            cmd.setObject(2, unidadeOrganizacionalId);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return mapUsuario(rs);
            }
        }
        return null;
    }

    public Usuario obterUsuario(UUID usuarioId) throws SQLException {
        String sql = """
            SELECT usuario_id, username, senha, nome, perfil, unidade_organizacional_id, cadastro_completo, jornada_usuario
            FROM usuario
            WHERE usuario_id = ?
            LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, usuarioId);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return mapUsuario(rs);
            }
        }
        return null;
    }

    public CodigoAcesso obterCodigoPorSms(String codigoSms, UUID usuarioId) throws SQLException {
        StringBuilder sql = new StringBuilder("""
            SELECT usuario_id, codigo, data_solicitacao, data_validacao, utilizado, codigo_reset_id, data_reset_id, reset_efetuado
            FROM codigo_acesso
            WHERE codigo = ?
        """);
        if (usuarioId != null) sql.append(" AND usuario_id = ?");
        sql.append(" ORDER BY data_solicitacao DESC LIMIT 1;");

        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql.toString())) {
            cmd.setString(1, codigoSms);
            if (usuarioId != null) cmd.setObject(2, usuarioId);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return mapCodigoAcesso(rs);
            }
        }
        return null;
    }

    public void atualizarCodigoValidado(UUID usuarioId, String codigoSms, String codigoResetId) throws SQLException {
        String sql = """
            UPDATE codigo_acesso
            SET utilizado = true, data_validacao = ?, codigo_reset_id = ?, data_reset_id = ?
            WHERE usuario_id = ? AND codigo = ?;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            Timestamp agora = Timestamp.valueOf(DateTimeHelper.saoPaulo());
            cmd.setTimestamp(1, agora);
            cmd.setString(2, codigoResetId);
            cmd.setTimestamp(3, agora);
            cmd.setObject(4, usuarioId);
            cmd.setString(5, codigoSms);
            cmd.executeUpdate();
        }
    }

    public void atualizarCodigoCadastroValidado(UUID usuarioId, String codigoSms) throws SQLException {
        String sql = """
            UPDATE codigo_acesso
            SET utilizado = true, data_validacao = ?
            WHERE usuario_id = ? AND codigo = ?;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setTimestamp(1, Timestamp.valueOf(DateTimeHelper.saoPaulo()));
            cmd.setObject(2, usuarioId);
            cmd.setString(3, codigoSms);
            cmd.executeUpdate();
        }
    }

    public int atualizarJornadaUsuario(UUID usuarioId, JornadaUsuario jornadaUsuario) throws SQLException {
        String sql = "UPDATE usuario SET jornada_usuario = ? WHERE usuario_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setInt(1, jornadaUsuario.getValor());
            cmd.setObject(2, usuarioId);
            return cmd.executeUpdate();
        }
    }

    public boolean buscarUltimoCodigo(UUID usuarioId, LocalDateTime dataSolicitacao, Integer minutosCooldown, int quantidadeMinima) throws SQLException {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(1) >= ?
            FROM (
                SELECT 1
                FROM codigo_acesso
                WHERE usuario_id = ?
                  AND data_solicitacao > ?
        """);

        if (minutosCooldown != null) {
            sql.append(" AND data_solicitacao > ? ");
        }

        sql.append(" LIMIT ? ) codigos;");

        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            cmd.setInt(idx++, quantidadeMinima);
            cmd.setObject(idx++, usuarioId);
            cmd.setTimestamp(idx++, Timestamp.valueOf(dataSolicitacao));

            if (minutosCooldown != null) {
                LocalDateTime limiteCooldown = DateTimeHelper.saoPaulo().minusMinutes(minutosCooldown);
                cmd.setTimestamp(idx++, Timestamp.valueOf(limiteCooldown));
            }

            cmd.setInt(idx, quantidadeMinima);

            try (ResultSet rs = cmd.executeQuery()) {
                return rs.next() && rs.getBoolean(1);
            }
        }
    }

    public CodigoAcesso obterCodigoPorId(String codigoResetId) throws SQLException {
        String sql = """
            SELECT usuario_id, codigo, data_solicitacao, data_validacao, utilizado, codigo_reset_id, data_reset_id, reset_efetuado
            FROM codigo_acesso
            WHERE codigo_reset_id = ?;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, codigoResetId);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return mapCodigoAcesso(rs);
            }
        }
        return null;
    }

    public void inserirCodigoAcesso(UUID usuarioId, String codigo) throws SQLException {
        String sql = """
            INSERT INTO codigo_acesso (usuario_id, codigo, data_solicitacao, utilizado)
            VALUES (?, ?, ?, false);
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, usuarioId);
            cmd.setString(2, codigo);
            cmd.setTimestamp(3, Timestamp.valueOf(DateTimeHelper.saoPaulo()));
            cmd.executeUpdate();
        }
    }

    public int redefinirSenha(UUID usuarioId, String novaSenha) throws SQLException {
        String sql = "UPDATE usuario SET senha = ? WHERE usuario_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, novaSenha);
            cmd.setObject(2, usuarioId);
            return cmd.executeUpdate();
        }
    }

    public void marcarResetEfetuado(String codigoResetId) throws SQLException {
        String sql = "UPDATE codigo_acesso SET reset_efetuado = true WHERE codigo_reset_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, codigoResetId);
            cmd.executeUpdate();
        }
    }

    private Usuario mapUsuario(ResultSet rs) throws SQLException {
        Usuario u = new Usuario();
        u.setUsuarioId(getUuidNullable(rs, "usuario_id"));
        u.setUsername(rs.getString("username"));
        u.setSenha(rs.getString("senha"));
        u.setNome(rs.getString("nome"));
        u.setPerfil(PerfilUsuario.fromValor(rs.getInt("perfil")));
        u.setUnidadeOrganizacionalId(getUuidNullable(rs, "unidade_organizacional_id"));
        u.setCadastroCompleto(rs.getBoolean("cadastro_completo"));
        u.setJornadaUsuario(JornadaUsuario.fromValor(rs.getInt("jornada_usuario")));
        return u;
    }

    private CodigoAcesso mapCodigoAcesso(ResultSet rs) throws SQLException {
        CodigoAcesso c = new CodigoAcesso();
        c.setUsuarioId(getUuidNullable(rs, "usuario_id"));
        c.setCodigo(rs.getString("codigo"));
        c.setDataSolicitacao(getDateTimeNullable(rs, "data_solicitacao"));
        c.setDataValidacao(getDateTimeNullable(rs, "data_validacao"));
        c.setUtilizado(rs.getBoolean("utilizado"));
        c.setCodigoResetId(rs.getString("codigo_reset_id"));
        c.setDataResetId(getDateTimeNullable(rs, "data_reset_id"));
        c.setResetEfetuado(rs.getBoolean("reset_efetuado"));
        return c;
    }
}