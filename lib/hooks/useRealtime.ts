"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useRealtime — WebSocket 실시간 연결 훅
 *
 * 커뮤니티 피드에서 새 좋아요/댓글을 실시간 반영
 * TODO: 서버에 WebSocket 엔드포인트 구현 후 활성화
 *
 * 사용:
 *   const { connected, lastMessage, send } = useRealtime("/ws/community");
 */

type MessageHandler = (data: unknown) => void;

export function useRealtime(url?: string) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());

  const connect = useCallback(() => {
    if (!url || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // 자동 재연결 (5초 후)
        setTimeout(connect, 5000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          handlersRef.current.forEach((h) => h(data));
        } catch { /* non-JSON message */ }
      };

      wsRef.current = ws;
    } catch { /* WebSocket not available */ }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const subscribe = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => { handlersRef.current.delete(handler); };
  }, []);

  return { connected, lastMessage, send, subscribe };
}
