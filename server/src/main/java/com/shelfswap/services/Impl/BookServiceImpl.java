package com.shelfswap.services.Impl;

import com.shelfswap.dtos.BookAddRequest;
import com.shelfswap.entities.Book;
import com.shelfswap.entities.ShelfBook;
import com.shelfswap.entities.User;
import com.shelfswap.repositories.BookRepository;
import com.shelfswap.repositories.ShelfBookRepository;
import com.shelfswap.repositories.UserRepository;
import com.shelfswap.services.BookService;
import com.shelfswap.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {
    private final BookRepository bookRepository;
    private final UserService userService;
    private final ShelfBookRepository shelfBookRepository;

    @Override
    public Book addToShelf(BookAddRequest request) {
        Book book;
        if (!isBookInDb(request.getId())) {
            book = addBookToDb(request);
        } else {
            // need 2 refactor
            Optional<Book> bookOp = bookRepository.findById(extractOLKey(request.getId()));
            book = bookOp.get();
        }
        User user = userService.getUserById(request.getUserId());
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
                .id(extractOLKey(request.getId()))
                .title(request.getTitle())
                .author(request.getAuthor())
                .coverUrl(String.format("https://covers.openlibrary.org/b/olid/%s-M.jpg", request.getCoverKey()))
                .build();
        return bookRepository.save(book);
    }

    private Boolean isBookInDb(String id) {
        return bookRepository.existsById(id);
    }

    private String extractOLKey(String input) {
        if (input == null || input.isEmpty()) {
            return null;
        }

        // Regex to match OL key patterns like OL12345W, OL67890M, etc.
        String regex = "(OL\\d+[A-Z])";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(regex);
        java.util.regex.Matcher matcher = pattern.matcher(input);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }
}
