package com.shelfswap.controllers;

import com.shelfswap.dtos.BookAddRequest;
import com.shelfswap.entities.Book;
import com.shelfswap.services.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/books")
@RequiredArgsConstructor
@Slf4j
public class BookController {
    private final BookService bookService;

    @PostMapping("/shelf")
    public ResponseEntity<Book> addToShelf(@Valid @RequestBody BookAddRequest request,
                                           @RequestAttribute String userEmail) {
        System.out.println(request.getId());
        return new ResponseEntity<>(bookService.addToShelf(request, userEmail),HttpStatus.CREATED);
    }
}
