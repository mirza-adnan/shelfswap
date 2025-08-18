package com.shelfswap.services;

import com.shelfswap.dtos.FeedEntryDTO;
import com.shelfswap.dtos.UserFeedDTO;
import com.shelfswap.repositories.ShelfBookRepository;
import com.shelfswap.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedService {
    private final ShelfBookRepository shelfBookRepository;
    private final UserRepository userRepository;

    public List<UserFeedDTO> getFeed(String userEmail) {
        UUID userId = userRepository.findIdByEmail(userEmail);
        List<FeedEntryDTO> rawResults = shelfBookRepository.findMatchingUsersAndBooks(userId);

        return rawResults.stream()
                .collect(Collectors.groupingBy(
                        FeedEntryDTO::getUser,
                        Collectors.mapping(FeedEntryDTO::getBook, Collectors.toList())
                ))
                .entrySet()
                .stream()
                .map(entry -> new UserFeedDTO(entry.getKey(), entry.getValue()))
                .toList();
    }
}
