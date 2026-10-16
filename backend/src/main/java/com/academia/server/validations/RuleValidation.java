package com.academia.server.validations;

public class RuleValidation {
    public static boolean cnpjValido(String cnpj) {
        if (cnpj == null || cnpj.isBlank()) return true;
        cnpj = cnpj.replaceAll("[^0-9]", "");
        if (cnpj.length() != 14) return false;
        if (cnpj.chars().distinct().count() == 1) return false;

        int[] mult1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] mult2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        String tempCnpj = cnpj.substring(0, 12);
        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += Character.getNumericValue(tempCnpj.charAt(i)) * mult1[i];
        }
        int resto = soma % 11;
        int digito1 = resto < 2 ? 0 : 11 - resto;

        tempCnpj += digito1;
        soma = 0;
        for (int i = 0; i < 13; i++) {
            soma += Character.getNumericValue(tempCnpj.charAt(i)) * mult2[i];
        }
        resto = soma % 11;
        int digito2 = resto < 2 ? 0 : 11 - resto;

        return cnpj.endsWith("" + digito1 + digito2);
    }
}