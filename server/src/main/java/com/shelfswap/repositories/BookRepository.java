package com.shelfswap.repositories;

import com.shelfswap.dtos.BookDTO;
import com.shelfswap.entities.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface BookRepository extends JpaRepository<Book, String> {
    @Query("""
        SELECT new com.shelfswap.dtos.BookDTO (
            b.id, b.title, b.author, b.coverUrl
            )
        FROM WishlistBook w
        JOIN ShelfBook s ON s.book.id = w.book.id
        JOIN Book b ON b.id = s.book.id
        WHERE s.user.id = :theirId
        AND w.user.id = :myId
    """)
    List<BookDTO> findMatchedBooksTheyOwn(@Param("myId") UUID myId, @Param("theirId") UUID theirId);

    @Query("""
       SELECT new com.shelfswap.dtos.BookDTO (
            b.id, b.title, b.author, b.coverUrl
            )
        FROM WishlistBook w
        JOIN ShelfBook s ON s.book.id = w.book.id
        JOIN Book b ON b.id = s.book.id
        WHERE w.user.id = :theirId
        AND s.user.id = :myId
    """)
    List<BookDTO> findMatchedBooksIOwn(@Param("myId") UUID myId, @Param("theirId") UUID theirId);

    @Query("""
        SELECT DISTINCT b
        FROM Book b
        JOIN ShelfBook sb ON sb.book.id = b.id
        WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))
        ORDER BY b.title
        """)
    List<Book> findBooksByTitleContaining(@Param("title") String title);
}
