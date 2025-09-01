package com.shelfswap.services;

import com.shelfswap.dtos.BookAddRequest;
import com.shelfswap.dtos.BookDTO;
import com.shelfswap.entities.Book;
import com.shelfswap.entities.ShelfBook;
import com.shelfswap.entities.User;
import com.shelfswap.entities.WishlistBook;
import com.shelfswap.exceptions.DuplicateExistsException;
import com.shelfswap.exceptions.NotFoundException;
import com.shelfswap.exceptions.MutuallyExclusiveException;
import com.shelfswap.repositories.BookRepository;
import com.shelfswap.repositories.ShelfBookRepository;
import com.shelfswap.repositories.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {
    private final BookRepository bookRepository;
    private final UserService userService;
    private final ShelfBookRepository shelfBookRepository;
    private final WishlistRepository wishlistRepository;

    public List<Book> getShelfBooksByUserId(UUID userId) {
        return shelfBookRepository.findShelfBooksByUserId(userId);
    }

    public List<Book> getWishlistBooksByUserId(UUID userId) {
        return wishlistRepository.findWishlistBookByUserId(userId);
    }

    @Transactional
    public Book addToShelfOrWishlist(BookAddRequest request, UUID userId, Boolean toShelf) {
        Book book;
        if (!isBookInDb(request.getId())) {
            book = addBookToDb(request);
            log.info("New book added to DB with title: {}", book.getTitle());
        } else {
            book = getBookById(request.getId());
        }
        User user = userService.getUserById(userId);

        if (canBeAdded(user.getId(), book.getId(), toShelf)) {
            if (toShelf) {
                ShelfBook shelfBook = ShelfBook.builder()
                        .user(user)
                        .book(book)
                        .build();
                shelfBookRepository.save(shelfBook);

                log.info("{} added to {}'s Shelf", book.getTitle(), user.getFirstName());
            } else {
                WishlistBook wishlistBook = WishlistBook.builder()
                        .user(user)
                        .book(book)
                        .build();
                wishlistRepository.save(wishlistBook);

                log.info("{} added to {}'s Wishlist", book.getTitle(), user.getFirstName());
            }
        }

        return book;
    }

    @Transactional
    public void removeFromShelfOrWishlist(String bookId, UUID userId, Boolean fromShelf) {
        if (!isBookInDb(bookId)) {
            throw new NotFoundException("Book not found");
        }
        
        if (fromShelf) {
            if (!shelfBookRepository.existsByUserIdAndBookId(userId, bookId)) {
                throw new NotFoundException("Book was not found in user's shelf");
            }
            shelfBookRepository.deleteByUserIdAndBookId(userId, bookId);
            log.info("Book with ID {} removed from user {}'s shelf", bookId, userId);
        } else {
            if (!wishlistRepository.existsByUserIdAndBookId(userId, bookId)) {
                throw new NotFoundException("Book not found in user's wishlist");
            }
            wishlistRepository.deleteByUserIdAndBookId(userId, bookId);
            log.info("Book with ID {} removed from user {}'s wishlist", bookId, userId);
        }
    }

    private Book addBookToDb(BookAddRequest request) {
        Book book = Book.builder()
                .id(request.getId())
                .title(request.getTitle())
                .author(request.getAuthor())
                .coverUrl(String.format("https://covers.openlibrary.org/b/id/%d-M.jpg", request.getCoverId()))
                .build();
        return bookRepository.save(book);
    }

    private Boolean isBookInDb(String id) {
        return bookRepository.existsById(id);
    }

    private Boolean canBeAdded(UUID userId, String bookId, Boolean shelf) {
        if (shelf) {
            if (wishlistRepository.existsByUserIdAndBookId(userId, bookId)) {
                throw new MutuallyExclusiveException("Book is already in your wishlist. Cannot add to Shelf.");
            }
            if (shelfBookRepository.existsByUserIdAndBookId(userId, bookId)) {
                throw new DuplicateExistsException("Book is already in your Shelf.");
            }
        } else {
            if (shelfBookRepository.existsByUserIdAndBookId(userId, bookId)) {
                throw new MutuallyExclusiveException("Book is already in your Shelf. Cannot add to Wishlist.");
            }
            if (wishlistRepository.existsByUserIdAndBookId(userId, bookId)) {
                throw new DuplicateExistsException("Book is already in your Wishlist.");
            }
        }
        return true;
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id).orElseThrow(() -> new NotFoundException("No book with given ID"));
    }
}
