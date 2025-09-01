package com.shelfswap.repositories;

import com.shelfswap.entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.initiator.id = :userId OR c.recipient.id = :userId) " +
           "ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByUserOrderByLastMessageAtDesc(@Param("userId") UUID userId);
    
    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.initiator.id = :user1Id AND c.recipient.id = :user2Id) OR " +
           "(c.initiator.id = :user2Id AND c.recipient.id = :user1Id))")
    Optional<Conversation> findBetweenUsers(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);
    
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.recipient.id = :userId AND c.status = 'PENDING' " +
           "ORDER BY c.createdAt DESC")
    List<Conversation> findPendingRequestsByRecipient(@Param("userId") UUID userId);
    
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.initiator.id = :userId AND c.status = 'PENDING' " +
           "ORDER BY c.createdAt DESC")
    List<Conversation> findPendingRequestsByInitiator(@Param("userId") UUID userId);
}