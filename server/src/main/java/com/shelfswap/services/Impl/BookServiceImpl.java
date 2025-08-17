package com.shelfswap.services.Impl;

import com.shelfswap.dtos.BookAddRequest;
import com.shelfswap.entities.Book;
import com.shelfswap.entities.ShelfBook;
import com.shelfswap.entities.User;
import com.shelfswap.entities.WishlistBook;
import com.shelfswap.exceptions.NotFoundException;
import com.shelfswap.repositories.BookRepository;
import com.shelfswap.repositories.ShelfBookRepository;
import com.shelfswap.repositories.WishlistRepository;
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
    private final WishlistRepository wishlistRepository;

    @Override
    public Book addToShelfOrWishlist(BookAddRequest request, String userEmail, Boolean toShelf) {
        Book book;
        if (!isBookInDb(request.getId())) {
            book = addBookToDb(request);
            log.info("New book added to DB with title: {}", book.getTitle());
        } else {
            book = getBookById(request.getId());
        }
        User user = userService.getUserByEmail(userEmail);
        if (toShelf) {
            ShelfBook shelfBook = ShelfBook.builder()
                    .user(user)
                    .book(book)
                    .build();
            shelfBookRepository.save(shelfBook);

            log.info("{} added to {}'s Shelf", book.getTitle(), userEmail);
        } else {
            WishlistBook wishlistBook = WishlistBook.builder()
                    .user(user)
                    .book(book)
                    .build();
            wishlistRepository.save(wishlistBook);

            log.info("{} added to {}'s Wishlist", book.getTitle(), userEmail);
        }

        return book;
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
