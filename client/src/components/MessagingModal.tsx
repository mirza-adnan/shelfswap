import React, { useState, useEffect } from "react";
import {
  X,
  MessageSquare,
  Users,
  Send,
  ArrowLeft,
  Check,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConversationDTO, MessageDTO } from "@/lib/type";
import { messagingApi } from "@/lib/messaging-api";
import { useAuth } from "@/contexts/AuthContext";

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConversation?: ConversationDTO | null;
}

const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  initialConversation,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("conversations");
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConversationDTO[]>(
    []
  );
  const [sentRequests, setSentRequests] = useState<ConversationDTO[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "chat">("list");

  useEffect(() => {
    if (isOpen) {
      loadData();

      // If there's an initial conversation, open it directly
      if (initialConversation) {
        handleConversationSelect(initialConversation);
      }
    }
  }, [isOpen, initialConversation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [conversationsData, receivedData, sentData] = await Promise.all([
        messagingApi.getConversations(),
        messagingApi.getReceivedRequests(),
        messagingApi.getSentRequests(),
      ]);
      setConversations(conversationsData);
      setReceivedRequests(receivedData);
      setSentRequests(sentData);
    } catch (error) {
      console.error("Failed to load messaging data:", error);
    }
    setLoading(false);
  };

  const handleAcceptRequest = async (conversationId: string) => {
    try {
      await messagingApi.acceptMessageRequest(conversationId);
      loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleRejectRequest = async (conversationId: string) => {
    try {
      await messagingApi.rejectMessageRequest(conversationId);
      loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  const handleConversationSelect = async (conversation: ConversationDTO) => {
    setSelectedConversation(conversation);
    setView("chat");
    try {
      const messagesData = await messagingApi.getConversationMessages(
        conversation.id
      );
      setMessages(messagesData.reverse()); // Reverse to show oldest first in UI
      await messagingApi.markMessagesAsRead(conversation.id);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await messagingApi.sendMessage(selectedConversation.id, {
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedConversation(null);
    setMessages([]);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getOtherUser = (conversation: ConversationDTO) => {
    return conversation.initiator.id === user?.id
      ? conversation.recipient
      : conversation.initiator;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1e1e1e] border border-[#333333] rounded-lg w-full max-w-4xl h-[80vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <div className="flex items-center gap-2">
            {view === "chat" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="text-white hover:text-white hover:bg-[#333333]"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <MessageSquare className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              {view === "chat" && selectedConversation
                ? getOtherUser(selectedConversation).firstName
                : "Messages"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:text-white hover:bg-[#333333]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {view === "list" ? (
          // List View
          <div className="flex flex-col h-[calc(80vh-80px)]">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-3 bg-[#333333] border-b border-[#333333] gap-px">
                <TabsTrigger
                  value="conversations"
                  className="text-white data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white border-r border-[#1e1e1e] last:border-r-0"
                >
                  Chats
                  {conversations.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-[#1e1e1e] text-white"
                    >
                      {conversations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="received"
                  className="text-white data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white border-r border-[#1e1e1e] last:border-r-0"
                >
                  Requests
                  {receivedRequests.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-blue-600 text-white"
                    >
                      {receivedRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="text-white data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white border-r border-[#1e1e1e] last:border-r-0"
                >
                  Sent
                  {sentRequests.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-[#1e1e1e] text-white"
                    >
                      {sentRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1">
                <TabsContent
                  value="conversations"
                  className="h-full m-0"
                >
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                      {loading ? (
                        <div className="text-center text-white py-8">
                          Loading conversations...
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="text-center text-white py-8">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No conversations yet</p>
                          <p className="text-sm">
                            Start messaging users from the feed!
                          </p>
                        </div>
                      ) : (
                        conversations.map((conversation) => {
                          const otherUser = getOtherUser(conversation);
                          return (
                            <div
                              key={conversation.id}
                              className="p-3 rounded-lg bg-[#333333] hover:bg-secondary/60 cursor-pointer transition-colors"
                              onClick={() =>
                                handleConversationSelect(conversation)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium text-white">
                                      {otherUser.firstName} {otherUser.lastName}
                                    </h3>
                                    <span className="text-xs text-white opacity-70">
                                      {formatTime(conversation.lastMessageAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-white opacity-80 truncate">
                                    {conversation.lastMessage ||
                                      "No messages yet"}
                                  </p>
                                </div>
                                {conversation.unreadMessageCount > 0 && (
                                  <Badge className="ml-2 bg-blue-600">
                                    {conversation.unreadMessageCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="received"
                  className="h-full m-0"
                >
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                      {receivedRequests.length === 0 ? (
                        <div className="text-center text-white py-8">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No message requests</p>
                        </div>
                      ) : (
                        receivedRequests.map((request) => (
                          <div
                            key={request.id}
                            className="p-4 rounded-lg bg-[#333333] border border-[#333333]"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-medium text-white mb-1">
                                  {request.initiator.firstName}{" "}
                                  {request.initiator.lastName}
                                </h3>
                                <span className="text-xs text-white opacity-70">
                                  {formatTime(request.createdAt)}
                                </span>
                              </div>
                            </div>

                            {request.introductoryMessage && (
                              <div className="mb-4 p-3 bg-[#1e1e1e] rounded-lg">
                                <p className="text-sm text-white">
                                  {request.introductoryMessage}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                                className="border-[#333333] text-white hover:bg-[#333333]"
                              >
                                <XIcon className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="sent"
                  className="h-full m-0"
                >
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                      {sentRequests.length === 0 ? (
                        <div className="text-center text-white py-8">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No sent requests</p>
                        </div>
                      ) : (
                        sentRequests.map((request) => (
                          <div
                            key={request.id}
                            className="p-4 rounded-lg bg-[#333333]"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-white">
                                {request.recipient.firstName}{" "}
                                {request.recipient.lastName}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-yellow-500 border-yellow-500"
                              >
                                Pending
                              </Badge>
                            </div>
                            <span className="text-xs text-white opacity-70">
                              Sent {formatTime(request.createdAt)}
                            </span>
                            {request.introductoryMessage && (
                              <div className="mt-2 p-3 bg-[#1e1e1e] rounded-lg">
                                <p className="text-sm text-white">
                                  {request.introductoryMessage}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          // Chat View
          <div className="flex flex-col h-[calc(80vh-80px)]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isMe = message.sender.id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMe
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {formatTime(message.sentAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-[#333333] p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-[#333333] border-[#333333] text-white placeholder:text-white placeholder:opacity-70"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingModal;
