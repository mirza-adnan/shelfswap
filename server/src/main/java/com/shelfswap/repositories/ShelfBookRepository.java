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

}
