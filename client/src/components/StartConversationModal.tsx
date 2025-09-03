import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserDTO, StartConversationRequest } from "@/lib/type";
import { messagingApi } from "@/lib/messaging-api";

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: UserDTO;
  onSuccess?: () => void;
}

const StartConversationModal: React.FC<StartConversationModalProps> = ({
  isOpen,
  onClose,
  recipient,
  onSuccess,
}) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    try {
      const request: StartConversationRequest = {
        recipientId: recipient.id,
        initialMessage: message.trim(),
      };

      await messagingApi.startConversation(request);

      setMessage("");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      setError(error.response?.data?.message || "Failed to start conversation");
    }

    setLoading(false);
  };

  const handleClose = () => {
    setMessage("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1e1e1e] border border-gray-700 rounded-lg w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-300" />
            <h2 className="text-lg font-semibold text-white">
              Message {recipient.firstName}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="p-4"
        >
          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-3">
              Send an introductory message to{" "}
              <span className="font-medium text-white">
                {recipient.firstName} {recipient.lastName}
              </span>
            </p>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I noticed we have some books in common and would love to chat about a potential book exchange..."
              className="bg-secondary border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
              maxLength={1000}
            />

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {message.length}/1000 characters
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-2 border-white bg-transparent text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || loading}
              className="bg-white text-black hover:bg-white"
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartConversationModal;
