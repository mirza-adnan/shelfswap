package com.shelfswap.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class BookAddRequest {
    @NotBlank(message = "Book ID is required")
    private String id;

    @NotBlank(message = "Book title is required")
    private String title;

    @NotBlank(message = "Book author's name is required")
    private String author;

    private Integer coverId;

    public void setId(String id) {
        this.id = extractOLKey(id); // automatically clean it
    }

    private String extractOLKey(String input) {
        if (input == null || input.isEmpty()) {
            return null;
        }
        String regex = "(OL\\d+[A-Z])";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(regex);
        java.util.regex.Matcher matcher = pattern.matcher(input);
        return matcher.find() ? matcher.group(1) : null;
    }
}
