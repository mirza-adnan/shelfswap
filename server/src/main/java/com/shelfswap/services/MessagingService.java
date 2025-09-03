package com.shelfswap.services;

import com.shelfswap.dtos.ConversationDTO;
import com.shelfswap.dtos.MessageDTO;
import com.shelfswap.entities.Conversation;
import com.shelfswap.entities.Message;
import com.shelfswap.entities.User;
import com.shelfswap.exceptions.UserNotFoundException;
import com.shelfswap.mappers.UserMapper;
import com.shelfswap.repositories.ConversationRepository;
import com.shelfswap.repositories.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessagingService {
    
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final UserMapper userMapper;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public ConversationDTO startConversation(UUID initiatorId, UUID recipientId, String initialMessage) {
        if (initiatorId.equals(recipientId)) {
            throw new IllegalArgumentException("Cannot start conversation with yourself");
        }
        
        conversationRepository.findBetweenUsers(initiatorId, recipientId)
            .ifPresent(existing -> {
                throw new IllegalArgumentException("Conversation already exists between these users");
            });
        
        User initiator = userService.getUserById(initiatorId);
        User recipient = userService.getUserById(recipientId);
        
        boolean hasMutualBooks = userService.hasMutualBooks(initiatorId, recipientId);
        
        Conversation conversation = Conversation.builder()
            .initiator(initiator)
            .recipient(recipient)
            .status(hasMutualBooks ? Conversation.ConversationStatus.ACCEPTED : Conversation.ConversationStatus.PENDING)
            .introductoryMessage(hasMutualBooks ? null : initialMessage)
            .build();
        
        conversation = conversationRepository.save(conversation);
        
        if (hasMutualBooks) {
            Message message = Message.builder()
                .conversation(conversation)
                .sender(initiator)
                .content(initialMessage)
                .build();
            
            messageRepository.save(message);
        }
        
        return mapToDTO(conversation, initiatorId);
    }
    
    @Transactional
    public void acceptMessageRequest(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        if (!conversation.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the recipient can accept the message request");
        }
        
        if (conversation.getStatus() != Conversation.ConversationStatus.PENDING) {
            throw new IllegalArgumentException("Message request is not pending");
        }
        
        conversation.setStatus(Conversation.ConversationStatus.ACCEPTED);
        conversationRepository.save(conversation);
    }
    
    @Transactional
    public void rejectMessageRequest(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        if (!conversation.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the recipient can reject the message request");
        }
        
        if (conversation.getStatus() != Conversation.ConversationStatus.PENDING) {
            throw new IllegalArgumentException("Message request is not pending");
        }
        
        conversation.setStatus(Conversation.ConversationStatus.REJECTED);
        conversationRepository.save(conversation);
    }
    
    @Transactional
    public MessageDTO sendMessage(UUID conversationId, UUID senderId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        if (!conversation.getInitiator().getId().equals(senderId) && 
            !conversation.getRecipient().getId().equals(senderId)) {
            throw new IllegalArgumentException("User is not part of this conversation");
        }
        
        if (conversation.getStatus() != Conversation.ConversationStatus.ACCEPTED) {
            throw new IllegalArgumentException("Cannot send message to non-accepted conversation");
        }
        
        User sender = userService.getUserById(senderId);
        
        Message message = Message.builder()
            .conversation(conversation)
            .sender(sender)
            .content(content)
            .build();
        
        message = messageRepository.save(message);
        
        MessageDTO messageDTO = MessageDTO.builder()
            .id(message.getId())
            .conversationId(conversationId)
            .sender(userMapper.toDTO(sender))
            .content(message.getContent())
            .sentAt(message.getSentAt())
            .isRead(message.isRead())
            .build();
        
        // Broadcast to both users in the conversation
        UUID recipientId = conversation.getInitiator().getId().equals(senderId) 
            ? conversation.getRecipient().getId() 
            : conversation.getInitiator().getId();
            
        messagingTemplate.convertAndSend("/queue/messages/" + senderId, messageDTO);
        messagingTemplate.convertAndSend("/queue/messages/" + recipientId, messageDTO);
        
        return messageDTO;
    }
    
    public List<ConversationDTO> getUserConversations(UUID userId) {
        List<Conversation> conversations = conversationRepository.findByUserOrderByLastMessageAtDesc(userId);
        
        return conversations.stream()
            .filter(c -> c.getStatus() == Conversation.ConversationStatus.ACCEPTED)
            .map(c -> mapToDTO(c, userId))
            .collect(Collectors.toList());
    }
    
    public ConversationDTO findConversationBetweenUsers(UUID user1Id, UUID user2Id) {
        return conversationRepository.findBetweenUsers(user1Id, user2Id)
            .filter(c -> c.getStatus() == Conversation.ConversationStatus.ACCEPTED)
            .map(c -> mapToDTO(c, user1Id))
            .orElse(null);
    }
    
    public List<ConversationDTO> getPendingMessageRequests(UUID userId) {
        List<Conversation> pendingRequests = conversationRepository.findPendingRequestsByRecipient(userId);
        
        return pendingRequests.stream()
            .map(c -> mapToDTO(c, userId))
            .collect(Collectors.toList());
    }
    
    public List<ConversationDTO> getSentMessageRequests(UUID userId) {
        List<Conversation> sentRequests = conversationRepository.findPendingRequestsByInitiator(userId);
        
        return sentRequests.stream()
            .map(c -> mapToDTO(c, userId))
            .collect(Collectors.toList());
    }
    
    public List<MessageDTO> getConversationMessages(UUID conversationId, UUID userId, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        if (!conversation.getInitiator().getId().equals(userId) && 
            !conversation.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("User is not part of this conversation");
        }
        
        List<Message> messages = messageRepository.findByConversationIdOrderBySentAtDesc(
            conversationId, PageRequest.of(page, size));
        
        return messages.stream()
            .map(this::mapMessageToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void markMessagesAsRead(UUID conversationId, UUID userId) {
        messageRepository.markMessagesAsRead(conversationId, userId);
    }
    
    private ConversationDTO mapToDTO(Conversation conversation, UUID currentUserId) {
        User otherUser = conversation.getInitiator().getId().equals(currentUserId) 
            ? conversation.getRecipient() 
            : conversation.getInitiator();
        
        Message lastMessage = messageRepository.findLastMessageByConversationId(conversation.getId());
        int unreadCount = messageRepository.countUnreadMessages(conversation.getId(), currentUserId);
        
        return ConversationDTO.builder()
            .id(conversation.getId())
            .initiator(userMapper.toDTO(conversation.getInitiator()))
            .recipient(userMapper.toDTO(conversation.getRecipient()))
            .status(conversation.getStatus())
            .introductoryMessage(conversation.getIntroductoryMessage())
            .createdAt(conversation.getCreatedAt())
            .lastMessageAt(conversation.getLastMessageAt())
            .lastMessage(lastMessage != null ? lastMessage.getContent() : null)
            .unreadMessageCount(unreadCount)
            .build();
    }
    
    private MessageDTO mapMessageToDTO(Message message) {
        return MessageDTO.builder()
            .id(message.getId())
            .conversationId(message.getConversation().getId())
            .sender(userMapper.toDTO(message.getSender()))
            .content(message.getContent())
            .sentAt(message.getSentAt())
            .isRead(message.isRead())
            .build();
    }
}