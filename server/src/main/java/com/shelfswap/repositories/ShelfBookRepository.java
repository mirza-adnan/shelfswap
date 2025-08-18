package com.shelfswap.repositories;

import com.shelfswap.dtos.FeedEntryDTO;
import com.shelfswap.entities.ShelfBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ShelfBookRepository extends JpaRepository<ShelfBook, UUID> {
    boolean existsByUserIdAndBookId(UUID userId, String bookId);

    @Query("""
    SELECT new com.shelfswap.dtos.FeedEntryDTO(
        new com.shelfswap.dtos.UserDTO(
            s.user.id, s.user.email, s.user.firstName, s.user.lastName
        ),
        new com.shelfswap.dtos.BookDTO(
            b.id,
            b.title,
            b.author,
            b.coverUrl
        )
    )
    FROM WishlistBook w
    JOIN ShelfBook s on w.book.id = s.book.id
    JOIN Book b on b.id = s.book.id
    WHERE w.user.id = :userId AND s.user.id <> :userId
""")
    List<FeedEntryDTO> findMatchingUsersAndBooks(@Param("userId") UUID userId);
}
