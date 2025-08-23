package com.shelfswap.repositories;

import com.shelfswap.dtos.UserDTO;
import com.shelfswap.entities.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    @Query("SELECT u.id FROM User u WHERE u.email = :email")
    UUID findIdByEmail(@Param("email") String email);

    @Query("""
        SELECT new com.shelfswap.dtos.UserDTO (
            s.user.id,
            s.user.email,
            s.user.firstName,
            s.user.lastName
        )
        FROM WishlistBook w
        JOIN ShelfBook s ON s.book.id = w.book.id
        WHERE w.user.id = :userId
        AND s.user.id <> :userId
        AND EXISTS (
            SELECT 1 FROM WishlistBook ww
            JOIN ShelfBook ss on ss.book.id = ww.book.id
            WHERE ww.user.id = s.user.id
            AND ss.user.id = :userId
            )
        GROUP BY s.user.id, s.user.email, s.user.firstName, s.user.lastName
        ORDER BY COUNT(s.book.id) DESC
    """)
    List<UserDTO> findMutualUsers(@Param("userId") UUID userId, Pageable page);
}
