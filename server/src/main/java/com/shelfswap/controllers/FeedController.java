package com.shelfswap.controllers;

import com.shelfswap.dtos.UserFeedDTO;
import com.shelfswap.services.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {
    private final FeedService feedService;

    @GetMapping
    public ResponseEntity<List<UserFeedDTO>> getFeed(@RequestAttribute("userEmail") String userEmail) {
        return new ResponseEntity<>(feedService.getFeed(userEmail), HttpStatus.OK);
    }
}
