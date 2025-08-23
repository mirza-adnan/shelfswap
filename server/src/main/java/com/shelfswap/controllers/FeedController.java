package com.shelfswap.controllers;

import com.shelfswap.dtos.FeedItem;
import com.shelfswap.services.FeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
@Slf4j
public class FeedController {
    private final FeedService feedService;

    @GetMapping
    public ResponseEntity<List<FeedItem>> getFeed(@RequestAttribute("userId") UUID userId) {
        List<FeedItem> feedData = feedService.getFeedMatches(userId);

        return new ResponseEntity<>(feedData, HttpStatus.OK);
    }
}
