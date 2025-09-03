# ShelfSwap Backend API Documentation

This document provides comprehensive details about all backend endpoints, including URLs, request structures, response structures, and authentication requirements.

## Base URL
```
http://localhost:8081/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
**Description:** Authenticate user and receive JWT token  
**Authentication:** Not required  
**Content-Type:** application/json

**Request Body:**
```json
{
  "email": "string (required, must be valid email)",
  "password": "string (required, min 8 characters)"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid (UUID format)",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "token": "string (JWT token)",
  "expiresIn": "number (milliseconds)"
}
```

**Validation Rules:**
- Email: Required, must be valid email format
- Password: Required, minimum 8 characters

---

### POST /auth/register
**Description:** Register new user account  
**Authentication:** Not required  
**Content-Type:** application/json

**Request Body:**
```json
{
  "email": "string (required, must be valid email)",
  "password": "string (required, min 8 characters)",
  "firstName": "string (required)",
  "lastName": "string (optional)"
}
```

**Response (201 CREATED):**
```json
{
  "id": "uuid (UUID format)",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "token": "string (JWT token)",
  "expiresIn": "number (milliseconds)"
}
```

**Validation Rules:**
- Email: Required, must be valid email format, must be unique
- Password: Required, minimum 8 characters
- FirstName: Required
- LastName: Optional

---

## 👤 User Endpoints

### GET /users/{userId}
**Description:** Get user profile data by ID  
**Authentication:** Required (JWT token)  

**URL Parameters:**
- `userId`: UUID - The user's unique identifier

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string"
}
```

---

## 📚 Book Management Endpoints

### GET /books/shelf/{userId}
**Description:** Get all books on a user's shelf  
**Authentication:** Required (JWT token)

**URL Parameters:**
- `userId`: UUID - The user's unique identifier

**Response (200 OK):**
```json
[
  {
    "id": "string (OpenLibrary ID format, e.g., 'OL123456M')",
    "title": "string",
    "author": "string",
    "coverUrl": "string (URL to book cover image, nullable)"
  }
]
```

---

### GET /books/wishlist/{userId}
**Description:** Get all books on a user's wishlist  
**Authentication:** Required (JWT token)

**URL Parameters:**
- `userId`: UUID - The user's unique identifier

**Response (200 OK):**
```json
[
  {
    "id": "string (OpenLibrary ID format)",
    "title": "string",
    "author": "string",
    "coverUrl": "string (URL to book cover image, nullable)"
  }
]
```

---

### POST /books/shelf
**Description:** Add a book to the authenticated user's shelf  
**Authentication:** Required (JWT token)  
**Content-Type:** application/json

**Request Body:**
```json
{
  "id": "string (required - OpenLibrary work key, e.g., '/works/OL123456W' or 'OL123456W')",
  "title": "string (required)",
  "author": "string (required)",
  "coverId": "number (optional - OpenLibrary cover ID)"
}
```

**Response (201 CREATED):**
```json
{
  "id": "string (cleaned OpenLibrary ID)",
  "title": "string",
  "author": "string",
  "coverUrl": "string (generated from coverId if provided, nullable)"
}
```

**Notes:**
- The `id` field automatically extracts OpenLibrary key from various formats
- If `coverId` is provided, `coverUrl` is automatically generated using OpenLibrary's cover API
- The authenticated user's ID is automatically extracted from JWT token

---

### POST /books/wishlist
**Description:** Add a book to the authenticated user's wishlist  
**Authentication:** Required (JWT token)  
**Content-Type:** application/json

**Request Body:**
```json
{
  "id": "string (required - OpenLibrary work key)",
  "title": "string (required)",
  "author": "string (required)",
  "coverId": "number (optional - OpenLibrary cover ID)"
}
```

**Response (201 CREATED):**
```json
{
  "id": "string (cleaned OpenLibrary ID)",
  "title": "string",
  "author": "string",
  "coverUrl": "string (generated from coverId if provided, nullable)"
}
```

---

### DELETE /books/shelf/{bookId}
**Description:** Remove a book from the authenticated user's shelf  
**Authentication:** Required (JWT token)

**URL Parameters:**
- `bookId`: string - The book's OpenLibrary ID

**Response (204 NO CONTENT):**
```
(Empty response body)
```

**Notes:**
- Only the book owner can remove books from their shelf
- User ID is automatically extracted from JWT token

---

### DELETE /books/wishlist/{bookId}
**Description:** Remove a book from the authenticated user's wishlist  
**Authentication:** Required (JWT token)

**URL Parameters:**
- `bookId`: string - The book's OpenLibrary ID

**Response (204 NO CONTENT):**
```
(Empty response body)
```

**Notes:**
- Only the book owner can remove books from their wishlist
- User ID is automatically extracted from JWT token

---

## 🔄 Feed Endpoints

### GET /feed
**Description:** Get personalized book exchange matches for the authenticated user  
**Authentication:** Required (JWT token)

**Response (200 OK):**
```json
[
  {
    "user": {
      "id": "uuid",
      "email": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "theirBooks": [
      {
        "id": "string (OpenLibrary ID)",
        "title": "string",
        "author": "string",
        "coverUrl": "string (nullable)"
      }
    ],
    "myBooks": [
      {
        "id": "string (OpenLibrary ID)",
        "title": "string",
        "author": "string",
        "coverUrl": "string (nullable)"
      }
    ]
  }
]
```

**Notes:**
- `theirBooks`: Books they own that you want (books on their shelf that match your wishlist)
- `myBooks`: Books you own that they want (books on your shelf that match their wishlist)
- Only shows users where there's a mutual match opportunity
- User ID is automatically extracted from JWT token

---

## 💬 Messaging System Endpoints

### POST /messages/conversations
**Description:** Start a new conversation with another user  
**Authentication:** Required (JWT token)  
**Content-Type:** application/json

**Request Body:**
```json
{
  "recipientId": "uuid (required - ID of the user to message)",
  "initialMessage": "string (required, max 1000 characters - introductory message)"
}
```

**Response (201 CREATED):**
```json
{
  "id": "uuid (conversation ID)",
  "initiator": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "recipient": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "status": "string (PENDING, ACCEPTED, or REJECTED)",
  "introductoryMessage": "string (null if users have mutual books)",
  "createdAt": "string (ISO datetime)",
  "lastMessageAt": "string (ISO datetime)",
  "lastMessage": "string (content of last message, nullable)",
  "unreadMessageCount": "number"
}
```

**Notes:**
- If users have mutual books, conversation is auto-accepted and initial message becomes first chat message
- If no mutual books, conversation goes to PENDING status and initial message becomes introductory message
- Cannot start conversation with yourself
- Returns error if conversation already exists between users

---

### GET /messages/conversations
**Description:** Get all accepted conversations for the authenticated user  
**Authentication:** Required (JWT token)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "initiator": { "id": "uuid", "email": "string", "firstName": "string", "lastName": "string" },
    "recipient": { "id": "uuid", "email": "string", "firstName": "string", "lastName": "string" },
    "status": "ACCEPTED",
    "introductoryMessage": "string (nullable)",
    "createdAt": "string (ISO datetime)",
    "lastMessageAt": "string (ISO datetime)",
    "lastMessage": "string (nullable)",
    "unreadMessageCount": "number"
  }
]
```

**Notes:**
- Only returns conversations with status = ACCEPTED
- Ordered by lastMessageAt (newest first)
- unreadMessageCount shows messages you haven't read

---

### GET /messages/requests/received
**Description:** Get pending message requests received by the authenticated user  
**Authentication:** Required (JWT token)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "initiator": { "id": "uuid", "email": "string", "firstName": "string", "lastName": "string" },
    "recipient": { "id": "uuid", "email": "string", "firstName": "string", "lastName": "string" },
    "status": "PENDING",
    "introductoryMessage": "string",
    "createdAt": "string (ISO datetime)",
    "lastMessageAt": "string (ISO datetime)",
    "lastMessage": null,
    "unreadMessageCount": 0
  }
]
```

**Notes:**
- Shows requests where you are the recipient and status is PENDING
- Contains introductory message explaining why they want to chat

---

### GET /messages/requests/sent
**Description:** Get pending message requests sent by the authenticated user  
**Authentication:** Required (JWT token)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "initiator": { "id": "uuid", "email": "string", "firstName": "string", "lastName": "string" },
    "recipient": { "id": "uuid", "email": "string", "firstName": "string", "lastName": "string" },
    "status": "PENDING",
    "introductoryMessage": "string",
    "createdAt": "string (ISO datetime)",
    "lastMessageAt": "string (ISO datetime)",
    "lastMessage": null,
    "unreadMessageCount": 0
  }
]
```

**Notes:**
- Shows requests where you are the initiator and status is PENDING
- Allows tracking of outbound requests awaiting response

---

### POST /messages/requests/{conversationId}/accept
**Description:** Accept a pending message request  
**Authentication:** Required (JWT token)

**URL Parameters:**
- `conversationId`: UUID - The conversation ID to accept

**Response (200 OK):**
```
(Empty response body)
```

**Notes:**
- Only the recipient can accept requests
- Changes conversation status from PENDING to ACCEPTED
- Users can now send messages normally

---

### POST /messages/requests/{conversationId}/reject
**Description:** Reject a pending message request  
**Authentication:** Required (JWT token)

**URL Parameters:**
- `conversationId`: UUID - The conversation ID to reject

**Response (200 OK):**
```
(Empty response body)
```

**Notes:**
- Only the recipient can reject requests
- Changes conversation status from PENDING to REJECTED
- No further messaging possible in this conversation

---

### POST /messages/conversations/{conversationId}
**Description:** Send a message in an accepted conversation  
**Authentication:** Required (JWT token)  
**Content-Type:** application/json

**URL Parameters:**
- `conversationId`: UUID - The conversation ID

**Request Body:**
```json
{
  "content": "string (required, max 1000 characters - message content)"
}
```

**Response (201 CREATED):**
```json
{
  "id": "uuid (message ID)",
  "conversationId": "uuid",
  "sender": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "content": "string",
  "sentAt": "string (ISO datetime)",
  "isRead": false
}
```

**Notes:**
- Only works on conversations with status = ACCEPTED
- Sender must be part of the conversation
- Automatically sets isRead = false for recipient

---

### GET /messages/conversations/{conversationId}
**Description:** Get messages from a conversation with pagination  
**Authentication:** Required (JWT token)

**URL Parameters:**
- `conversationId`: UUID - The conversation ID

**Query Parameters:**
- `page`: number (optional, default: 0) - Page number for pagination
- `size`: number (optional, default: 50) - Number of messages per page

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "conversationId": "uuid",
    "sender": {
      "id": "uuid",
      "email": "string", 
      "firstName": "string",
      "lastName": "string"
    },
    "content": "string",
    "sentAt": "string (ISO datetime)",
    "isRead": "boolean"
  }
]
```

**Notes:**
- Messages are returned in descending order (newest first) for pagination
- User must be part of the conversation to view messages
- Default page size is 50 messages

---

### POST /messages/conversations/{conversationId}/read
**Description:** Mark all unread messages in a conversation as read  
**Authentication:** Required (JWT token)

**URL Parameters:**
- `conversationId`: UUID - The conversation ID

**Response (200 OK):**
```
(Empty response body)
```

**Notes:**
- Marks all messages sent by the other user as read
- Does not affect messages you sent
- Updates isRead status for UI notification purposes

---

## 💬 Messaging System Overview

The messaging system works as follows:

### 1. **Mutual Book Matches (Direct Chat)**
- When users have mutual books (your wishlist books they own + their wishlist books you own)
- Conversations are automatically ACCEPTED
- Users can chat immediately without approval process
- Initial message becomes the first chat message

### 2. **No Mutual Books (Message Request)**
- When users don't have mutual book matches
- Conversation starts with PENDING status
- Initial message becomes an "introductory message" explaining why you want to chat
- Recipient must accept/reject the request before normal chatting can begin

### 3. **Conversation Statuses**
- **PENDING**: Message request waiting for recipient approval
- **ACCEPTED**: Normal chat enabled, users can send messages
- **REJECTED**: Request denied, no further messaging possible

### 4. **Message Management**
- Real-time messaging within accepted conversations
- Read receipts and unread message counts
- Paginated message history
- Maximum 1000 characters per message

### 5. **User Experience Flow**
```
User A clicks "Message" on User B's profile
    ↓
Check if A and B have mutual books
    ↓
If YES: Auto-accept conversation, send message immediately
    ↓  
If NO: Create PENDING request with introductory message
    ↓
User B sees request in "Received Requests"
    ↓
User B accepts/rejects
    ↓
If accepted: Normal chat begins
If rejected: No further communication
```

---

## 🚫 Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "string (error description)",
  "message": "string (detailed message)",
  "timestamp": "string (ISO datetime)"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "string (authentication error details)",
  "timestamp": "string (ISO datetime)"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "string (resource not found details)",
  "timestamp": "string (ISO datetime)"
}
```

### 422 Validation Error
```json
{
  "error": "Validation failed",
  "message": "string (validation error details)",
  "timestamp": "string (ISO datetime)"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "string (server error details)",
  "timestamp": "string (ISO datetime)"
}
```

---

## 📝 Data Types and Formats

### UUID Format
All user IDs use UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### OpenLibrary ID Format
Book IDs use OpenLibrary work key format: `OL[digits][letter]` (e.g., `OL123456M`, `OL789012W`)

### Cover URL Format
Book cover URLs follow OpenLibrary cover API format:
```
https://covers.openlibrary.org/b/id/{coverId}-{size}.jpg
```
Where size can be: S (small), M (medium), L (large)

### JWT Token
JWT tokens are used for authentication and contain:
- User ID (UUID)
- Email
- Expiration timestamp
- Signature for verification

---

## 🔒 Security Notes

1. **JWT Authentication**: Most endpoints require valid JWT token in Authorization header
2. **User Isolation**: Users can only access and modify their own data
3. **Input Validation**: All request bodies are validated according to specified rules
4. **Rate Limiting**: Consider implementing rate limiting for production use
5. **CORS**: Configure CORS settings for your frontend domain

---

## 🚀 Integration Examples

### Frontend Authentication Flow
```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await loginResponse.json();

// 2. Store token
localStorage.setItem('token', token);

// 3. Use token in subsequent requests
const booksResponse = await fetch('/api/books/shelf/user-uuid', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Adding Books with OpenLibrary Integration
```javascript
// 1. Search OpenLibrary
const searchResponse = await fetch(
  `https://openlibrary.org/search.json?q=${query}&limit=20`
);
const { docs } = await searchResponse.json();

// 2. Add selected book
const bookData = {
  id: docs[0].key, // e.g., "/works/OL123456W"
  title: docs[0].title,
  author: docs[0].author_name[0],
  coverId: docs[0].cover_i // optional
};

const addResponse = await fetch('/api/books/shelf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(bookData)
});
```

This API provides a complete book exchange platform with user management, book collections, and personalized matching capabilities.