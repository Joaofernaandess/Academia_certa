package com.academia.server.repositories;

import com.academia.server.models.UnidadeOrganizacional;
import com.academia.server.models.LogoImagem;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class UnidadeOrganizacionalRepository extends BaseRepository {

    public UnidadeOrganizacionalRepository(DataSource dataSource) {
        super(dataSource);
    }

    public UUID cadastrar(UnidadeOrganizacional u, LogoImagem logo) throws SQLException {
        UUID unidadeOrganizacionalId = UUID.randomUUID();
        String sql = """
            INSERT INTO unidade_organizacional
            (unidade_organizacional_id, matriz_id, cnpj, razao_social, nome_fantasia, cep, endereco, numero, complemento, bairro, cidade, uf, pais, email, telefone, aprovado, logo_mime_type, logo_data, logo_atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(6));
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, unidadeOrganizacionalId);
            setUuid(cmd, 2, u.getMatrizId());
            cmd.setString(3, u.getCnpj());
            cmd.setString(4, u.getRazaoSocial());
            cmd.setString(5, u.getNomeFantasia());
            cmd.setString(6, u.getCep());
            cmd.setString(7, u.getEndereco());
            cmd.setString(8, u.getNumero());
            cmd.setString(9, u.getComplemento());
            cmd.setString(10, u.getBairro());
            cmd.setString(11, u.getCidade());
            cmd.setString(12, u.getUf());
            cmd.setString(13, u.getPais());
            cmd.setString(14, u.getEmail());
            cmd.setString(15, u.getTelefone());
            cmd.setBoolean(16, u.isAprovado());
            cmd.setString(17, logo != null ? logo.contentType() : null);
            cmd.setBytes(18, logo != null ? logo.dados() : null);
            if (cmd.executeUpdate() > 0) return unidadeOrganizacionalId;
        }
        return null;
    }

    public List<UnidadeOrganizacional> obterLista(String razaoSocial, String cnpj, Boolean aprovado, int skip, int top) throws SQLException {
        List<UnidadeOrganizacional> lista = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT unidade_organizacional_id, matriz_id, cnpj, razao_social, nome_fantasia, cep, endereco, numero,
                   complemento, bairro, cidade, uf, pais, email, telefone, aprovado,
                   CASE WHEN logo_data IS NULL THEN NULL
                        ELSE CONCAT('/v1/unidades-organizacionais/', unidade_organizacional_id,
                                    '/logo?v=', logo_atualizado_em) END AS logo_url
            FROM unidade_organizacional
            WHERE 1 = 1
        """);
        if (aprovado != null) sql.append(" AND aprovado = ?");
        if (razaoSocial != null && !razaoSocial.isBlank()) sql.append(" AND LOWER(razao_social) LIKE LOWER(?)");
        if (cnpj != null && !cnpj.isBlank()) sql.append(" AND LOWER(cnpj) LIKE LOWER(?)");
        sql.append(" ORDER BY razao_social ASC LIMIT ? OFFSET ?;");

        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            if (aprovado != null) cmd.setBoolean(idx++, aprovado);
            if (razaoSocial != null && !razaoSocial.isBlank()) cmd.setString(idx++, "%" + razaoSocial.trim() + "%");
            if (cnpj != null && !cnpj.isBlank()) cmd.setString(idx++, "%" + cnpj.trim() + "%");
            cmd.setInt(idx++, top);
            cmd.setInt(idx, skip);

            try (ResultSet rs = cmd.executeQuery()) {
                while (rs.next()) lista.add(mapUnidade(rs));
            }
        }
        return lista;
    }

    public UnidadeOrganizacional obter(UUID id) throws SQLException {
        String sql = """
            SELECT unidade_organizacional_id, matriz_id, cnpj, razao_social, nome_fantasia, cep, endereco, numero,
                   complemento, bairro, cidade, uf, pais, email, telefone, aprovado,
                   CASE WHEN logo_data IS NULL THEN NULL
                        ELSE CONCAT('/v1/unidades-organizacionais/', unidade_organizacional_id,
                                    '/logo?v=', logo_atualizado_em) END AS logo_url
            FROM unidade_organizacional WHERE unidade_organizacional_id = ? LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return mapUnidade(rs);
            }
        }
        return null;
    }

    public boolean validarDuplicidade(String cnpj, UUID ignoreId) throws SQLException {
        String sql = "SELECT 1 FROM unidade_organizacional WHERE cnpj = ? AND unidade_organizacional_id <> ? LIMIT 1;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, cnpj);
            setUuid(cmd, 2, ignoreId);
            try (ResultSet rs = cmd.executeQuery()) {
                return rs.next();
            }
        }
    }

    public int aprovarUnidade(UUID id) throws SQLException {
        String sql = "UPDATE unidade_organizacional SET aprovado = true WHERE unidade_organizacional_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            return cmd.executeUpdate();
        }
    }

    public LogoImagem obterLogo(UUID id) throws SQLException {
        String sql = "SELECT logo_mime_type, logo_data FROM unidade_organizacional WHERE unidade_organizacional_id = ? LIMIT 1;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) {
                    byte[] dados = rs.getBytes("logo_data");
                    return dados == null ? null : new LogoImagem(rs.getString("logo_mime_type"), dados);
                }
            }
        }
        return null;
    }

    public int atualizarLogo(UUID id, LogoImagem logo) throws SQLException {
        String sql = """
                UPDATE unidade_organizacional
                SET logo_mime_type = ?, logo_data = ?, logo_atualizado_em = CURRENT_TIMESTAMP(6)
                WHERE unidade_organizacional_id = ?;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setString(1, logo.contentType());
            cmd.setBytes(2, logo.dados());
            setUuid(cmd, 3, id);
            return cmd.executeUpdate();
        }
    }

    public int removerLogo(UUID id) throws SQLException {
        String sql = """
                UPDATE unidade_organizacional
                SET logo_mime_type = NULL, logo_data = NULL, logo_atualizado_em = NULL
                WHERE unidade_organizacional_id = ?;
                """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            setUuid(cmd, 1, id);
            return cmd.executeUpdate();
        }
    }

    private UnidadeOrganizacional mapUnidade(ResultSet rs) throws SQLException {
        UnidadeOrganizacional u = new UnidadeOrganizacional();
        u.setUnidadeOrganizacionalId(getUuidNullable(rs, "unidade_organizacional_id"));
        u.setMatrizId(getUuidNullable(rs, "matriz_id"));
        u.setCnpj(rs.getString("cnpj"));
        u.setRazaoSocial(rs.getString("razao_social"));
        u.setNomeFantasia(rs.getString("nome_fantasia"));
        u.setCep(rs.getString("cep"));
        u.setEndereco(rs.getString("endereco"));
        u.setNumero(rs.getString("numero"));
        u.setComplemento(rs.getString("complemento"));
        u.setBairro(rs.getString("bairro"));
        u.setCidade(rs.getString("cidade"));
        u.setUf(rs.getString("uf"));
        u.setPais(rs.getString("pais"));
        u.setEmail(rs.getString("email"));
        u.setTelefone(rs.getString("telefone"));
        u.setAprovado(rs.getBoolean("aprovado"));
        u.setLogoUrl(rs.getString("logo_url"));
        return u;
    }
}