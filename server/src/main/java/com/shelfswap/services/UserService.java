package com.shelfswap.services;

import com.shelfswap.entities.User;

import java.util.UUID;

public interface UserService {
    User getUserById(UUID id);
    User getUserByEmail(String email);
}
