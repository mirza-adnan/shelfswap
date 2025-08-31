package com.shelfswap.repositories;

import com.shelfswap.entities.Book;
import com.shelfswap.entities.WishlistBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface WishlistRepository extends JpaRepository<WishlistBook, UUID> {
    boolean existsByUserIdAndBookId(UUID userId, String bookId);

    @Query("""
        SELECT b
        FROM WishlistBook wb
        JOIN Book b ON b.id = wb.book.id
        WHERE wb.user.id = :userId
    """)
    List<Book> findWishlistBookByUserId(@Param("userId") UUID userId);

    void deleteByUserIdAndBookId(UUID userId, String bookId);
}
