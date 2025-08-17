package com.shelfswap.services;

import com.shelfswap.dtos.BookAddRequest;
import com.shelfswap.entities.Book;

public interface BookService {
    Book addToShelf(BookAddRequest request, String userEmail);
    Book addToWishlist();
}
