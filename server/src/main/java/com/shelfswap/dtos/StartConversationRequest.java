package com.shelfswap.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartConversationRequest {
    @NotNull(message = "Recipient ID is required")
    private UUID recipientId;
    
    @NotBlank(message = "Initial message is required")
    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String initialMessage;
}