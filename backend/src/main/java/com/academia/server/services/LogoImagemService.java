package com.academia.server.services;

import com.academia.server.exceptions.ValidationException;
import com.academia.server.models.LogoImagem;
import com.academia.server.validations.ValidationError;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;

@Service
public class LogoImagemService extends BaseService {
    public static final int TAMANHO_MAXIMO_BYTES = 2 * 1024 * 1024;
    private static final String PNG = "image/png";
    private static final String JPEG = "image/jpeg";

    public LogoImagem decodificarDataUrl(String dataUrl) throws ValidationException {
        if (dataUrl == null || dataUrl.isBlank()) return null;

        int separator = dataUrl.indexOf(',');
        String header = separator < 0 ? "" : dataUrl.substring(0, separator);
        String payload = separator < 0 ? "" : dataUrl.substring(separator + 1);
        String contentType = header.equals("data:image/png;base64") ? PNG
                : header.equals("data:image/jpeg;base64") ? JPEG : null;

        if (contentType == null || payload.isBlank()
                || payload.length() > ((TAMANHO_MAXIMO_BYTES + 2L) / 3L) * 4L) {
            throw erroLogo("A logo deve ser uma imagem PNG ou JPG de até 2 MB.");
        }

        try {
            return validar(contentType, Base64.getDecoder().decode(payload));
        } catch (IllegalArgumentException ex) {
            throw erroLogo("Não foi possível ler o arquivo da logo.");
        }
    }

    public LogoImagem validarUpload(String contentType, byte[] dados) throws ValidationException {
        return validar(contentType, dados);
    }

    private LogoImagem validar(String contentType, byte[] dados) throws ValidationException {
        if (dados == null || dados.length == 0) {
            throw erroLogo("Selecione uma imagem para a logo.");
        }
        if (dados.length > TAMANHO_MAXIMO_BYTES) {
            throw erroLogo("A logo deve ter no máximo 2 MB.");
        }

        boolean png = PNG.equalsIgnoreCase(contentType)
                && dados.length >= 8
                && (dados[0] & 0xff) == 0x89
                && dados[1] == 0x50
                && dados[2] == 0x4e
                && dados[3] == 0x47
                && dados[4] == 0x0d
                && dados[5] == 0x0a
                && dados[6] == 0x1a
                && dados[7] == 0x0a;
        boolean jpeg = JPEG.equalsIgnoreCase(contentType)
                && dados.length >= 3
                && (dados[0] & 0xff) == 0xff
                && (dados[1] & 0xff) == 0xd8
                && (dados[2] & 0xff) == 0xff;

        if (!png && !jpeg) {
            throw erroLogo("O conteúdo do arquivo não corresponde a uma imagem PNG ou JPG válida.");
        }

        return new LogoImagem(png ? PNG : JPEG, dados);
    }

    private ValidationException erroLogo(String mensagem) {
        return new ValidationException(List.of(new ValidationError("logo", mensagem)));
    }
}
