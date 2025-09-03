import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDTO, ConversationDTO } from "@/lib/type";
import { messagingApi } from "@/lib/messaging-api";
import StartConversationModal from "./StartConversationModal";
import MessagingModal from "./MessagingModal";
import { useToast } from "@/hooks/use-toast";

interface MessageButtonProps {
  recipient: UserDTO;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "ghost";
  iconOnly?: boolean;
}

const MessageButton: React.FC<MessageButtonProps> = ({
  recipient,
  className = "",
  size = "default",
  variant = "default",
  iconOnly = false,
}) => {
  const [isStartConversationModalOpen, setIsStartConversationModalOpen] =
    useState(false);
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);
  const [existingConversation, setExistingConversation] =
    useState<ConversationDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMessageClick = async () => {
    setLoading(true);

    try {
      const conversation = await messagingApi.checkExistingConversation(
        recipient.id
      );

      if (conversation) {
        setExistingConversation(conversation);
        setIsMessagingModalOpen(true);
      } else {
        setIsStartConversationModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to check existing conversation:", error);
      toast({
        title: "Error",
        description: "Failed to check conversation status. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleConversationSuccess = () => {
    setIsStartConversationModalOpen(false);
    toast({
      title: "Message sent!",
      description: "Your conversation has been started.",
    });

    setIsMessagingModalOpen(true);
  };

  const handleMessagingModalClose = () => {
    setIsMessagingModalOpen(false);
    setExistingConversation(null);
  };

  return (
    <>
      <Button
        onClick={handleMessageClick}
        disabled={loading}
        className={className}
        size={size}
        variant={variant}
      >
        <Send className={`h-4 w-4 ${iconOnly ? "" : "mr-2"}`} />
        {!iconOnly && (loading ? "Loading..." : "Message")}
      </Button>

      <StartConversationModal
        isOpen={isStartConversationModalOpen}
        onClose={() => setIsStartConversationModalOpen(false)}
        recipient={recipient}
        onSuccess={handleConversationSuccess}
      />

      <MessagingModal
        isOpen={isMessagingModalOpen}
        onClose={handleMessagingModalClose}
        initialConversation={existingConversation}
      />
    </>
  );
};

export default MessageButton;
