package com.shelfswap.dtos;

import com.shelfswap.entities.Conversation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDTO {
    private UUID id;
    private UserDTO initiator;
    private UserDTO recipient;
    private Conversation.ConversationStatus status;
    private String introductoryMessage;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private String lastMessage;
    private int unreadMessageCount;
}