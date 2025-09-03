import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { MessageDTO } from "@/lib/type";

interface UseWebSocketReturn {
  isConnected: boolean;
  isReady: boolean;
  subscribe: (userId: string, callback: (message: MessageDTO) => void) => void;
  unsubscribe: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Create WebSocket client
    const client = new Client({
      webSocketFactory: () => {
        const socket = new SockJS("http://localhost:8081/ws");
        return socket;
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("WebSocket debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      // Set ready state after a small delay to ensure connection is fully established
      setTimeout(() => {
        setIsReady(true);
      }, 100);
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      setIsReady(false);
    };

    client.onStompError = (frame) => {
      console.error("WebSocket error:", frame.headers["message"]);
      console.error("Additional details:", frame.body);
    };

    clientRef.current = client;
    client.activate();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      client.deactivate();
    };
  }, []);

  const subscribe = (
    userId: string,
    callback: (message: MessageDTO) => void
  ) => {
    if (!clientRef.current || !isReady || !clientRef.current.connected) {
      return;
    }

    // Unsubscribe from previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    try {
      // Subscribe to user's message queue
      subscriptionRef.current = clientRef.current.subscribe(
        `/queue/messages/${userId}`,
        (message) => {
          try {
            const messageData: MessageDTO = JSON.parse(message.body);
            callback(messageData);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        }
      );
    } catch (error) {
      console.error("Error subscribing to WebSocket:", error);
    }
  };

  const unsubscribe = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  };

  return {
    isConnected,
    isReady,
    subscribe,
    unsubscribe,
  };
};
