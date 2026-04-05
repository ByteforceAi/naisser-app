"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Script from "next/script";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: Record<string, unknown>) => void;
      };
    };
  }
}

interface KakaoShareButtonProps {
  /** 공유 제목 */
  title: string;
  /** 공유 설명 */
  description: string;
  /** OG 이미지 URL */
  imageUrl?: string;
  /** 공유 링크 URL (프로필 페이지 URL) */
  url: string;
  /** 버튼 텍스트 */
  buttonText?: string;
  /** 버튼 스타일 클래스 */
  className?: string;
  /** 인라인 스타일 */
  style?: React.CSSProperties;
  /** 공유 완료 콜백 */
  onShare?: () => void;
  /** 자식 요소 (커스텀 버튼) */
  children: React.ReactNode;
}

export function KakaoShareButton({
  title,
  description,
  imageUrl,
  url,
  buttonText = "프로필 보기",
  className,
  style,
  onShare,
  children,
}: KakaoShareButtonProps) {
  const initialized = useRef(false);

  const initKakao = useCallback(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "44c81dad1ea599a9009db5876b8825dd";
    if (!key || !window.Kakao) return;
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(key);
    }
    initialized.current = true;
  }, []);

  useEffect(() => {
    if (window.Kakao) initKakao();
  }, [initKakao]);

  const handleShare = () => {
    if (!window.Kakao?.isInitialized()) {
      // Kakao SDK 미로드 시 클립보드 폴백
      navigator.clipboard.writeText(url).then(() => {
        alert("링크가 복사되었습니다. 카카오톡에 붙여넣기 해주세요!");
      });
      onShare?.();
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: imageUrl || `${window.location.origin}/og-default.png`,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: buttonText,
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    });
    onShare?.();
  };

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        integrity="sha384-DKYJZ8NLiK8MN4/C5P2ezmFnkrMiqJ/IjnpRaGLnkOSsa3KB0ww5kMjS5aWT4r5"
        crossOrigin="anonymous"
        onLoad={initKakao}
      />
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleShare}
        className={className}
        style={style}
      >
        {children}
      </motion.button>
    </>
  );
}
