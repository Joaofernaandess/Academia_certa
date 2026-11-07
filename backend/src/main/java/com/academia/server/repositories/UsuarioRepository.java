package com.academia.server.repositories;

import com.academia.server.models.JornadaUsuario;
import com.academia.server.models.PerfilUsuario;
import com.academia.server.models.Usuario;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class UsuarioRepository extends BaseRepository {

    public UsuarioRepository(DataSource dataSource) {
        super(dataSource);
    }

    public UUID cadastrar(Usuario usuario) throws SQLException {
        UUID usuarioId = UUID.randomUUID();
        String sql = """
            INSERT INTO usuario (usuario_id, username, senha, nome, perfil, unidade_organizacional_id, cadastro_completo, jornada_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, usuarioId);
            cmd.setString(2, usuario.getUsername());
            cmd.setString(3, usuario.getSenha());
            cmd.setString(4, usuario.getNome());
            cmd.setInt(5, usuario.getPerfil().getValor());
            setUuid(cmd, 6, usuario.getUnidadeOrganizacionalId());
            cmd.setBoolean(7, usuario.isCadastroCompleto());
            cmd.setInt(8, usuario.getJornadaUsuario().getValor());
            if (cmd.executeUpdate() > 0) return usuarioId;
        }
        return null;
    }

    public int atualizarNome(Usuario.UsuarioPatchRequest usuario, UUID usuarioId) throws SQLException {
        String sql = "UPDATE usuario SET nome = ? WHERE usuario_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, usuario.getNome());
            setUuid(cmd, 2, usuarioId);
            return cmd.executeUpdate();
        }
    }

    public Usuario obter(UUID usuarioId) throws SQLException {
        String sql = """
            SELECT usuario_id, username, senha, nome, perfil, unidade_organizacional_id, cadastro_completo, jornada_usuario
            FROM usuario WHERE usuario_id = ? LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, usuarioId);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) {
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
            }
        }
        return null;
    }

    public List<Usuario.UsuarioGetResponse> obterLista(String username, UUID unidadeOrganizacionalId, Boolean cadastroCompleto, int skip, int top) throws SQLException {
        List<Usuario.UsuarioGetResponse> lista = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT u.usuario_id, u.username, u.nome, u.unidade_organizacional_id, u.cadastro_completo, u.jornada_usuario,
                   COALESCE(uo.nome_fantasia, uo.razao_social, 'Sem Unidade') AS nome_unidade
            FROM usuario u
            LEFT JOIN unidade_organizacional uo ON u.unidade_organizacional_id = uo.unidade_organizacional_id
            WHERE 1 = 1
        """);
        if (username != null && !username.isBlank()) sql.append(" AND LOWER(u.username) LIKE LOWER(?)");
        if (unidadeOrganizacionalId != null) sql.append(" AND u.unidade_organizacional_id = ?");
        if (cadastroCompleto != null) sql.append(" AND u.cadastro_completo = ?");
        sql.append(" ORDER BY u.nome ASC LIMIT ? OFFSET ?;");

        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            if (username != null && !username.isBlank()) cmd.setString(idx++, "%" + username.trim() + "%");
            if (unidadeOrganizacionalId != null) setUuid(cmd, idx++, unidadeOrganizacionalId);
            if (cadastroCompleto != null) cmd.setBoolean(idx++, cadastroCompleto);
            cmd.setInt(idx++, top);
            cmd.setInt(idx, skip);

            try (ResultSet rs = cmd.executeQuery()) {
                while (rs.next()) {
                    Usuario.UsuarioGetResponse item = new Usuario.UsuarioGetResponse();
                    item.setUsuarioId(getUuidNullable(rs, "usuario_id"));
                    item.setUsername(rs.getString("username"));
                    item.setNome(rs.getString("nome"));
                    item.setCadastroCompleto(rs.getBoolean("cadastro_completo"));
                    item.setJornadaUsuario(JornadaUsuario.fromValor(rs.getInt("jornada_usuario")));
                    item.setNomeUnidadeOrganizacional(rs.getString("nome_unidade"));
                    lista.add(item);
                }
            }
        }
        return lista;
    }

    public boolean verificarUsuarioExiste(String username, UUID unidadeOrganizacionalId, UUID ignoreId) throws SQLException {
        String sql = """
            SELECT 1 FROM usuario
            WHERE username = ? AND unidade_organizacional_id = ? AND usuario_id <> ?
            LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, username);
            setUuid(cmd, 2, unidadeOrganizacionalId);
            setUuid(cmd, 3, ignoreId);
            try (ResultSet rs = cmd.executeQuery()) {
                return rs.next();
            }
        }
    }

    public int validarAcesso(UUID usuarioId) throws SQLException {
        String sql = "UPDATE usuario SET cadastro_completo = true, jornada_usuario = ? WHERE usuario_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setInt(1, JornadaUsuario.Completed.getValor());
            setUuid(cmd, 2, usuarioId);
            return cmd.executeUpdate();
        }
    }
}