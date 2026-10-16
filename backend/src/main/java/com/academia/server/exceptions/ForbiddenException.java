// Arquivo: exceptions/ForbiddenException.java
package com.academia.server.exceptions;
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) { super(message); }
}