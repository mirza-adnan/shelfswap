package com.shelfswap.controllers;

import com.shelfswap.dtos.BookAddRequest;
import com.shelfswap.dtos.BookDTO;
import com.shelfswap.dtos.UserDTO;
import com.shelfswap.entities.Book;
import com.shelfswap.repositories.BookRepository;
import com.shelfswap.repositories.ShelfBookRepository;
import com.shelfswap.services.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/books")
@RequiredArgsConstructor
@Slf4j
public class BookController {
    private final BookService bookService;
    private final ShelfBookRepository shelfBookRepository;
    private final BookRepository bookRepository;

    @GetMapping("/shelf/{userId}")
    public ResponseEntity<List<Book>> getShelfBooksByUserId(@PathVariable UUID userId) {
        return new ResponseEntity<>(bookService.getShelfBooksByUserId(userId), HttpStatus.OK);
    }

    @GetMapping("/wishlist/{userId}")
    public ResponseEntity<List<Book>> getWishlistBooksByUserId(@PathVariable UUID userId) {
        return new ResponseEntity<>(bookService.getWishlistBooksByUserId(userId), HttpStatus.OK);
    }

    @PostMapping("/shelf")
    public ResponseEntity<Book> addToShelf(@Valid @RequestBody BookAddRequest request,
                                           @RequestAttribute("userId") UUID userId) {
        return new ResponseEntity<>(bookService.addToShelfOrWishlist(request, userId, true),HttpStatus.CREATED);
    }

    @PostMapping("/wishlist")
    public ResponseEntity<Book> addToWishlist(@Valid @RequestBody BookAddRequest request,
                                              @RequestAttribute("userId") UUID userId) {
        return new ResponseEntity<>(bookService.addToShelfOrWishlist(request, userId, false), HttpStatus.CREATED);
    }

    @DeleteMapping("/shelf/{bookId}")
    public ResponseEntity<Void> removeFromShelf(@PathVariable String bookId,
                                                @RequestAttribute("userId") UUID userId) {
        bookService.removeFromShelfOrWishlist(bookId, userId, true);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/wishlist/{bookId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable String bookId,
                                                   @RequestAttribute("userId") UUID userId) {
        System.out.println(bookId);
        System.out.println(userId);
        bookService.removeFromShelfOrWishlist(bookId, userId, false);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String q) {
        List<Book> books = bookService.searchBooksByTitle(q);
        return new ResponseEntity<>(books, HttpStatus.OK);
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<Book> getBookById(@PathVariable String bookId) {
        Book book = bookService.getBookById(bookId);
        return new ResponseEntity<>(book, HttpStatus.OK);
    }

    @GetMapping("/{bookId}/users")
    public ResponseEntity<List<UserDTO>> getUsersWhoHaveBook(@PathVariable String bookId,
                                                             @RequestAttribute("userId") UUID currentUserId) {
        List<UserDTO> users = bookService.getUsersWhoHaveBook(bookId, currentUserId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/matched/{userId}")
    public ResponseEntity<List<BookDTO>> getMatchedBooks(@PathVariable UUID userId,
                                                         @RequestAttribute("userId") UUID currentUserId) {
        List<BookDTO> matchedBooks = bookRepository.findMatchedBooksTheyOwn(currentUserId, userId);
        return new ResponseEntity<>(matchedBooks, HttpStatus.OK);
    }
}
