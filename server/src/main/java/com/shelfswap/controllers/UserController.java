package com.shelfswap.controllers;

import com.shelfswap.dtos.UserDTO;
import com.shelfswap.entities.User;
import com.shelfswap.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserData(@PathVariable UUID userId) {
        return new ResponseEntity<>(userService.getUserDtoById(userId),HttpStatus.OK);
    }
}
