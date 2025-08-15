package com.shelfswap.services;

import com.shelfswap.dtos.RegistrationRequest;
import com.shelfswap.entities.User;
import org.springframework.security.core.userdetails.UserDetails;

public interface AuthenticationService {
    UserDetails authenticate(String email, String password);
    String generateToken(String value);
    UserDetails validateToken(String token);
    User register(RegistrationRequest request);
}
