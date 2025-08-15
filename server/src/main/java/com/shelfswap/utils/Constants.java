package com.shelfswap.utils;

import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

@NoArgsConstructor
public class Constants {
    @Value("${jwt.secret}")
    public static String secretKey;
    public static final long TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60;
}