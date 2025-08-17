package com.shelfswap.exceptions;

public class MutuallyExclusiveException extends RuntimeException {
    public MutuallyExclusiveException(String message) {
        super(message);
    }
}
