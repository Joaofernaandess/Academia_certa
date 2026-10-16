package com.academia.server.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum JornadaUsuario {
    RegisterPage(1),
    CodeValidatePage(2),
    WaitingApprovalPage(3),
    Completed(4);

    private final int valor;

    JornadaUsuario(int valor) {
        this.valor = valor;
    }

    @JsonValue
    public int getValor() {
        return valor;
    }

    @JsonCreator
    public static JornadaUsuario fromValor(Object valor) {
        if (valor instanceof Number num) {
            for (JornadaUsuario j : values()) {
                if (j.valor == num.intValue()) return j;
            }
        }
        if (valor instanceof String str) {
            for (JornadaUsuario j : values()) {
                if (j.name().equalsIgnoreCase(str) || String.valueOf(j.valor).equals(str)) return j;
            }
        }
        return RegisterPage;
    }
}