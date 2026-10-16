package com.academia.server.repositories;

import com.academia.server.models.UnidadeOrganizacional;
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

    public UUID cadastrar(UnidadeOrganizacional u) throws SQLException {
        String sql = """
            INSERT INTO unidade_organizacional
            (matriz_id, cnpj, razao_social, nome_fantasia, cep, endereco, numero, complemento, bairro, cidade, uf, pais, email, telefone, aprovado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING unidade_organizacional_id;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, u.getMatrizId());
            cmd.setString(2, u.getCnpj());
            cmd.setString(3, u.getRazaoSocial());
            cmd.setString(4, u.getNomeFantasia());
            cmd.setString(5, u.getCep());
            cmd.setString(6, u.getEndereco());
            cmd.setString(7, u.getNumero());
            cmd.setString(8, u.getComplemento());
            cmd.setString(9, u.getBairro());
            cmd.setString(10, u.getCidade());
            cmd.setString(11, u.getUf());
            cmd.setString(12, u.getPais());
            cmd.setString(13, u.getEmail());
            cmd.setString(14, u.getTelefone());
            cmd.setBoolean(15, u.isAprovado());
            try (ResultSet rs = cmd.executeQuery()) {
                if (rs.next()) return getUuidNullable(rs, "unidade_organizacional_id");
            }
        }
        return null;
    }

    public List<UnidadeOrganizacional> obterLista(String razaoSocial, String cnpj, Boolean aprovado, int skip, int top) throws SQLException {
        List<UnidadeOrganizacional> lista = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT unidade_organizacional_id, matriz_id, cnpj, razao_social, nome_fantasia, cep, endereco, numero,
                   complemento, bairro, cidade, uf, pais, email, telefone, aprovado
            FROM unidade_organizacional
            WHERE 1 = 1
        """);
        if (aprovado != null) sql.append(" AND aprovado = ?");
        if (razaoSocial != null && !razaoSocial.isBlank()) sql.append(" AND razao_social ILIKE ?");
        if (cnpj != null && !cnpj.isBlank()) sql.append(" AND cnpj ILIKE ?");
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
                   complemento, bairro, cidade, uf, pais, email, telefone, aprovado
            FROM unidade_organizacional WHERE unidade_organizacional_id = ? LIMIT 1;
        """;
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, id);
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
            cmd.setObject(2, ignoreId);
            try (ResultSet rs = cmd.executeQuery()) {
                return rs.next();
            }
        }
    }

    public int aprovarUnidade(UUID id) throws SQLException {
        String sql = "UPDATE unidade_organizacional SET aprovado = true WHERE unidade_organizacional_id = ?;";
        try (Connection conn = getConnection(); PreparedStatement cmd = conn.prepareStatement(sql)) {
            cmd.setObject(1, id);
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
        return u;
    }
}