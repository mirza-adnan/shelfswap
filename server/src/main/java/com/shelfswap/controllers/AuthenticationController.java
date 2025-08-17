package com.shelfswap.controllers;

import com.shelfswap.dtos.AuthResponse;
import com.shelfswap.dtos.LoginRequest;
import com.shelfswap.dtos.RegistrationRequest;
import com.shelfswap.entities.User;
import com.shelfswap.services.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        User user = authenticationService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
        AuthResponse authResponse = authenticationService.buildAuthResponse(user);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegistrationRequest request) {
        User user = authenticationService.register(request);
        AuthResponse response = authenticationService.buildAuthResponse(user);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
