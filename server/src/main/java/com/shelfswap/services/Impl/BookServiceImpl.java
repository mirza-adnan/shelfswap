package com.shelfswap.services.Impl;

import com.shelfswap.dtos.BookAddRequest;
import com.shelfswap.entities.Book;
import com.shelfswap.entities.ShelfBook;
import com.shelfswap.entities.User;
import com.shelfswap.exceptions.NotFoundException;
import com.shelfswap.repositories.BookRepository;
import com.shelfswap.repositories.ShelfBookRepository;
import com.shelfswap.services.BookService;
import com.shelfswap.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {
    private final BookRepository bookRepository;
    private final UserService userService;
    private final ShelfBookRepository shelfBookRepository;

    @Override
    public Book addToShelf(BookAddRequest request, String userEmail) {
        Book book;
        if (!isBookInDb(request.getId())) {
            book = addBookToDb(request);
        } else {
            book = getBookById(request.getId());
        }
        User user = userService.getUserByEmail(userEmail);
        ShelfBook shelfBook = ShelfBook.builder()
                .user(user)
                .book(book)
                .build();
        shelfBookRepository.save(shelfBook);
        log.info("New book added with title: {}", book.getTitle());

        return book;
    }

    @Override
    public Book addToWishlist() {
        return null;
    }

    private Book addBookToDb(BookAddRequest request) {
        Book book = Book.builder()
                .id(request.getId())
                .title(request.getTitle())
                .author(request.getAuthor())
                .coverUrl(String.format("https://covers.openlibrary.org/b/olid/%s-M.jpg", request.getCoverKey()))
                .build();
        return bookRepository.save(book);
    }

    private Boolean isBookInDb(String id) {
        return bookRepository.existsById(id);
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id).orElseThrow(() -> new NotFoundException("No book with given ID"));
    }
}
