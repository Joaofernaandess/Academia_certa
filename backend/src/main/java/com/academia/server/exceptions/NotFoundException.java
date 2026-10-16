// Arquivo: exceptions/NotFoundException.java
package com.academia.server.exceptions;
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) { super(message); }
}