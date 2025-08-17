package com.shelfswap.repositories;

import com.shelfswap.entities.WishlistBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WishlistRepository extends JpaRepository<WishlistBook, UUID> {

}
