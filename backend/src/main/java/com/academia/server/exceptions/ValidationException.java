package com.academia.server.exceptions;

import com.academia.server.validations.ValidationError;
import java.util.List;

public class ValidationException extends RuntimeException {
    private final List<ValidationError> errors;

    public ValidationException(List<ValidationError> errors) {
        super("Ocorreram erros de validação.");
        this.errors = errors;
    }

    public List<ValidationError> getErrors() {
        return errors;
    }
}