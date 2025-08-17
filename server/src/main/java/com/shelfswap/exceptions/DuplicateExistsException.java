package com.shelfswap.exceptions;

public class DuplicateExistsException extends RuntimeException {
    public DuplicateExistsException(String message) {
        super(message);
    }
}
