package com.shelfswap.controllers;

import com.shelfswap.dtos.ConversationDTO;
import com.shelfswap.dtos.MessageDTO;
import com.shelfswap.dtos.MessageRequest;
import com.shelfswap.dtos.StartConversationRequest;
import com.shelfswap.services.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {
    
    private final MessagingService messagingService;
    
    @PostMapping("/conversations")
    public ResponseEntity<ConversationDTO> startConversation(
            @Valid @RequestBody StartConversationRequest request,
            @RequestAttribute("userId") UUID initiatorId) {
        ConversationDTO conversation = messagingService.startConversation(
            initiatorId, request.getRecipientId(), request.getInitialMessage());
        return new ResponseEntity<>(conversation, HttpStatus.CREATED);
    }
    
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@RequestAttribute("userId") UUID userId) {
        List<ConversationDTO> conversations = messagingService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }
    
    @GetMapping("/check-conversation/{otherUserId}")
    public ResponseEntity<ConversationDTO> checkExistingConversation(
            @PathVariable UUID otherUserId,
            @RequestAttribute("userId") UUID userId) {
        ConversationDTO conversation = messagingService.findConversationBetweenUsers(userId, otherUserId);
        return conversation != null ? ResponseEntity.ok(conversation) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/requests/received")
    public ResponseEntity<List<ConversationDTO>> getPendingMessageRequests(@RequestAttribute("userId") UUID userId) {
        List<ConversationDTO> requests = messagingService.getPendingMessageRequests(userId);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/requests/sent")
    public ResponseEntity<List<ConversationDTO>> getSentMessageRequests(@RequestAttribute("userId") UUID userId) {
        List<ConversationDTO> requests = messagingService.getSentMessageRequests(userId);
        return ResponseEntity.ok(requests);
    }
    
    @PostMapping("/requests/{conversationId}/accept")
    public ResponseEntity<Void> acceptMessageRequest(
            @PathVariable UUID conversationId,
            @RequestAttribute("userId") UUID userId) {
        messagingService.acceptMessageRequest(conversationId, userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/requests/{conversationId}/reject")
    public ResponseEntity<Void> rejectMessageRequest(
            @PathVariable UUID conversationId,
            @RequestAttribute("userId") UUID userId) {
        messagingService.rejectMessageRequest(conversationId, userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/conversations/{conversationId}")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable UUID conversationId,
            @Valid @RequestBody MessageRequest request,
            @RequestAttribute("userId") UUID senderId) {
        MessageDTO message = messagingService.sendMessage(conversationId, senderId, request.getContent());
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }
    
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestAttribute("userId") UUID userId) {
        List<MessageDTO> messages = messagingService.getConversationMessages(conversationId, userId, page, size);
        return ResponseEntity.ok(messages);
    }
    
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable UUID conversationId,
            @RequestAttribute("userId") UUID userId) {
        messagingService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }
}