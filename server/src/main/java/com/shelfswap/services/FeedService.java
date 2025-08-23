package com.shelfswap.services;

import com.shelfswap.dtos.FeedItem;
import com.shelfswap.dtos.UserDTO;
import com.shelfswap.repositories.BookRepository;
import com.shelfswap.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedService {
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public List<FeedItem> getFeedMatches(UUID userId) {
        Pageable range = PageRequest.of(0, 10);
        List<UserDTO> matchedUsers = userRepository.findMutualUsers(userId, range);

        List<FeedItem> feedData = matchedUsers
                .stream()
                .map(userDto -> {
                    return FeedItem.builder()
                            .user(userDto)
                            .theirBooks(bookRepository.findMatchedBooksTheyOwn(userId, userDto.getId()))
                            .myBooks(bookRepository.findMatchedBooksIOwn(userId, userDto.getId()))
                            .build();
                })
                .toList();

        System.out.println(feedData);

        return feedData;
    }
}
