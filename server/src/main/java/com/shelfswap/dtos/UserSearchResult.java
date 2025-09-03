package com.shelfswap.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResult {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private long shelfBooksCount;
    private long wishlistBooksCount;
}