"use client";

import { useEffect, useState } from "react";

/**
 * usePushNotifications — 푸시 알림 등록/관리 훅
 *
 * 사용:
 *   const { supported, permission, requestPermission } = usePushNotifications();
 *   if (supported && permission !== "granted") {
 *     <button onClick={requestPermission}>알림 받기</button>
 *   }
 */
export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    const isSupported = "serviceWorker" in navigator && "PushManager" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Service Worker 등록
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW 등록 실패 — 무시
    });
  }, [supported]);

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        // TODO: FCM 토큰 가져와서 서버에 등록
        // const reg = await navigator.serviceWorker.ready;
        // const sub = await reg.pushManager.subscribe({ ... });
        // await fetch("/api/push/register", { method: "POST", body: JSON.stringify(sub) });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return { supported, permission, requestPermission };
}
