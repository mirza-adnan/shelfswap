package com.shelfswap.services;

import com.shelfswap.dtos.UserDTO;
import com.shelfswap.entities.User;
import com.shelfswap.exceptions.UserNotFoundException;
import com.shelfswap.mappers.UserMapper;
import com.shelfswap.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public User getUserById(UUID id) throws BadCredentialsException {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("No account associated with this ID"));
    }

    public UserDTO getUserDtoById(UUID id) throws BadCredentialsException {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("No account associated with this ID"));
        return userMapper.toDTO(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("No account with email:" + email));
    }
}
