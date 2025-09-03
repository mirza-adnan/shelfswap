package com.shelfswap.repositories;

import com.shelfswap.dtos.BookDTO;
import com.shelfswap.entities.Book;
import com.shelfswap.entities.ShelfBook;
import com.shelfswap.entities.User;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNullApi;

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

    void deleteByUserIdAndBookId(UUID userId, String bookId);

    @Query("""
        SELECT DISTINCT sb.user
        FROM ShelfBook sb
        WHERE sb.book.id = :bookId
        AND sb.user.id != :excludeUserId
        ORDER BY sb.user.createdAt DESC
        """)
    List<User> findUsersByBookIdExcluding(@Param("bookId") String bookId, @Param("excludeUserId") UUID excludeUserId);
}
