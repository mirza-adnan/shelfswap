package com.shelfswap.services.Impl;

import com.shelfswap.services.UserService;
import com.shelfswap.utils.Constants;
import com.shelfswap.dtos.AuthResponse;
import com.shelfswap.dtos.RegistrationRequest;
import com.shelfswap.entities.User;
import com.shelfswap.exceptions.EmailAlreadyExistsException;
import com.shelfswap.exceptions.UserNotFoundException;
import com.shelfswap.repositories.UserRepository;
import com.shelfswap.services.AuthenticationService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public User authenticate(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    @Override
    public String generateToken(String value) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(value)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + (Constants.TOKEN_EXPIRATION_SECONDS * 1000)))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact(); // <- gets the string version of the jwt object
    }

    @Override
    public UserDetails validateToken(String token) {
        String userId = extractPayload(token);
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return userDetailsService.loadUserByUsername(user.getEmail());
    }

    @Override
    @Transactional
    public User register(RegistrationRequest request) throws IllegalStateException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered with email: {}", savedUser.getEmail());

        return savedUser;
    }

    @Override
    public AuthResponse buildAuthResponse(User user) {
        String token = generateToken(user.getId().toString());
        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .token(token)
                .expiresIn(Constants.TOKEN_EXPIRATION_SECONDS)
                .build();
    }

    @Override
    public String extractPayload(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
