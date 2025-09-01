package com.shelfswap.repositories;

import com.shelfswap.entities.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.sentAt ASC")
    List<Message> findByConversationIdOrderBySentAtAsc(@Param("conversationId") UUID conversationId);
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.sentAt DESC")
    List<Message> findByConversationIdOrderBySentAtDesc(@Param("conversationId") UUID conversationId, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.conversation.id = :conversationId AND " +
           "m.sender.id != :userId AND " +
           "m.isRead = false")
    int countUnreadMessages(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);
    
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE " +
           "m.conversation.id = :conversationId AND " +
           "m.sender.id != :userId AND " +
           "m.isRead = false")
    void markMessagesAsRead(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.sentAt DESC LIMIT 1")
    Message findLastMessageByConversationId(@Param("conversationId") UUID conversationId);
}