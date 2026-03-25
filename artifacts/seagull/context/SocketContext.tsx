import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";
const WS_URL = API_URL.replace(/^http/, "ws");

type EventHandler = (data: unknown) => void;

interface SocketContextValue {
  connected: boolean;
  joinOrder: (orderId: number) => void;
  leaveOrder: (orderId: number) => void;
  on: (event: string, handler: EventHandler) => void;
  off: (event: string, handler: EventHandler) => void;
}

const SocketContext = createContext<SocketContextValue>({
  connected: false,
  joinOrder: () => {},
  leaveOrder: () => {},
  on: () => {},
  off: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedRooms = useRef<Set<number>>(new Set());

  const emit = useCallback((event: string, data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
    }
  }, []);

  const fireEvent = useCallback((event: string, data: unknown) => {
    const handlers = listenersRef.current.get(event);
    handlers?.forEach((h) => {
      try {
        h(data);
      } catch {}
    });
  }, []);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_URL}/socket.io/?EIO=4&transport=websocket`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        joinedRooms.current.forEach((id) => {
          emit("join-order", id);
        });
      };

      ws.onmessage = (event) => {
        try {
          const text = event.data as string;
          if (text.startsWith("42")) {
            const payload = JSON.parse(text.slice(2));
            const [evtName, evtData] = payload;
            fireEvent(evtName, evtData);
          }
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {}
  }, [emit, fireEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const joinOrder = useCallback(
    (orderId: number) => {
      joinedRooms.current.add(orderId);
      emit("join-order", orderId);
    },
    [emit]
  );

  const leaveOrder = useCallback(
    (orderId: number) => {
      joinedRooms.current.delete(orderId);
      emit("leave-order", orderId);
    },
    [emit]
  );

  const on = useCallback((event: string, handler: EventHandler) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(handler);
  }, []);

  const off = useCallback((event: string, handler: EventHandler) => {
    listenersRef.current.get(event)?.delete(handler);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, joinOrder, leaveOrder, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
