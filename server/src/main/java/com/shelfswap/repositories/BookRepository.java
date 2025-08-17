package com.shelfswap.repositories;

import com.shelfswap.entities.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BookRepository extends JpaRepository<Book, String> {
}
