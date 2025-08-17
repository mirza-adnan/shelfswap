package com.shelfswap.services.Impl;

import com.shelfswap.entities.User;
import com.shelfswap.exceptions.UserNotFoundException;
import com.shelfswap.repositories.UserRepository;
import com.shelfswap.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public User getUserById(UUID id) throws BadCredentialsException {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("No account associated with this ID"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("No account with email:" + email));
    }
}
