package com.academia.server.models;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public final class GymManagementModels {
    private GymManagementModels() {}

    public record AlunoRequest(
            String nome,
            String cpf,
            String email,
            String telefone,
            LocalDate dataNascimento,
            String situacao) {}

    public record Aluno(
            UUID alunoId,
            String nome,
            String cpf,
            String email,
            String telefone,
            LocalDate dataNascimento,
            String situacao) {}

    public record PlanoRequest(
            String nome,
            String descricao,
            BigDecimal valor,
            Integer duracaoDias,
            Boolean ativo) {}

    public record Plano(
            UUID planoId,
            String nome,
            String descricao,
            BigDecimal valor,
            int duracaoDias,
            boolean ativo) {}

    public record InstrutorRequest(
            String nome,
            String cpf,
            String email,
            String telefone,
            String especialidade,
            Boolean ativo) {}

    public record Instrutor(
            UUID instrutorId,
            String nome,
            String cpf,
            String email,
            String telefone,
            String especialidade,
            boolean ativo) {}

    public record PagamentoRequest(
            UUID alunoId,
            UUID planoId,
            BigDecimal valor,
            LocalDate dataVencimento,
            LocalDate dataPagamento,
            String situacao) {}

    public record Pagamento(
            UUID pagamentoId,
            UUID alunoId,
            String alunoNome,
            UUID planoId,
            String planoNome,
            BigDecimal valor,
            LocalDate dataVencimento,
            LocalDate dataPagamento,
            String situacao) {}
}
