package com.shelfswap.services;

import com.shelfswap.dtos.BookAddRequest;
import com.shelfswap.entities.Book;

public interface BookService {
    Book addToShelfOrWishlist(BookAddRequest request, String userId, Boolean toShelf);
}
