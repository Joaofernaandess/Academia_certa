package com.academia.server.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PerfilUsuario {
    Admin(1),
    Normal(2),
    Gestor(3);

    private final int valor;

    PerfilUsuario(int valor) {
        this.valor = valor;
    }

    @JsonValue
    public int getValor() {
        return valor;
    }

    @JsonCreator
    public static PerfilUsuario fromValor(Object valor) {
        if (valor instanceof Number num) {
            int v = num.intValue();
            if (v == 1) return Admin;
            if (v == 3) return Gestor;
            return Normal;
        }
        if (valor instanceof String str) {
            if ("1".equals(str) || "Admin".equalsIgnoreCase(str)) return Admin;
            if ("3".equals(str) || "Gestor".equalsIgnoreCase(str)) return Gestor;
        }
        return Normal;
    }
}