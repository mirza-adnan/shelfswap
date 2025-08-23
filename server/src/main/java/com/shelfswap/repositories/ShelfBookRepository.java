package com.shelfswap.repositories;

import com.shelfswap.entities.ShelfBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShelfBookRepository extends JpaRepository<ShelfBook, UUID> {
    boolean existsByUserIdAndBookId(UUID userId, String bookId);
}
