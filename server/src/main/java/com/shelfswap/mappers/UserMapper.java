package com.shelfswap.mappers;

import com.shelfswap.dtos.UserDTO;
import com.shelfswap.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {
    
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    
    UserDTO toDTO(User user);
    
    User toEntity(UserDTO userDTO);
}