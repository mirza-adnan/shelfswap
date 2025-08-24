package com.shelfswap.repositories;

import com.shelfswap.dtos.BookDTO;
import com.shelfswap.entities.Book;
import com.shelfswap.entities.ShelfBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ShelfBookRepository extends JpaRepository<ShelfBook, UUID> {
    boolean existsByUserIdAndBookId(UUID userId, String bookId);

    @Query("""
        SELECT b
        FROM ShelfBook sb
        JOIN Book b ON b.id = sb.book.id
        WHERE sb.user.id = :userId
    """)
    List<Book> findShelfBooksByUserId(@Param("userId") UUID userId);
}
