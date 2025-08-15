package com.shelfswap.controllers;

import com.shelfswap.dtos.AuthResponse;
import com.shelfswap.dtos.LoginRequest;
import com.shelfswap.dtos.RegistrationRequest;
import com.shelfswap.entities.User;
import com.shelfswap.repositories.UserRepository;
import com.shelfswap.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping(path = "/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        UserDetails userDetails = authenticationService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        Optional<User> userOp = userRepository.findByEmail(loginRequest.getEmail());
        User user;
        if (userOp.isPresent()) {
            user = userOp.get();
        } else {
            throw new BadCredentialsException("");
        }
        String tokenValue = authenticationService.generateToken(loginRequest.getEmail());

        System.out.println(user.getPassword());

        AuthResponse authResponse = AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .token(tokenValue)
                .expiresIn(24 * 60 * 60)
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegistrationRequest request) {
        User user = authenticationService.register(request);
        String tokenValue = authenticationService.generateToken(user.getEmail());
        AuthResponse response = AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .token(tokenValue)
                .expiresIn(24 * 60 * 60)
                .build();
        return new ResponseEntity<AuthResponse>(response, HttpStatus.CREATED);
    }
}
