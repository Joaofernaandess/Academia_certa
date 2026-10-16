package com.academia.server.services;

import com.academia.server.validations.ValidationError;
import java.util.ArrayList;
import java.util.List;

public abstract class BaseService {
    protected List<ValidationError> createErrorList() {
        return new ArrayList<>();
    }

    protected void addError(List<ValidationError> errors, String field, String message) {
        errors.add(new ValidationError(field, message));
    }
}