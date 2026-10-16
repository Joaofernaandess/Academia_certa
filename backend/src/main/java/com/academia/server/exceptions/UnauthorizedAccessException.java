// Arquivo: exceptions/UnauthorizedAccessException.java
package com.academia.server.exceptions;
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) { super(message); }
}