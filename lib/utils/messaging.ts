/**
 * 메시징 시스템 구조
 *
 * 강사 간 DM + 지역별 그룹 채팅
 * 추후 WebSocket 연동으로 실시간 메시지
 *
 * 현재는 구조만 정의
 */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "text" | "image" | "system";
  createdAt: string;
  readBy: string[];
}

export interface Conversation {
  id: string;
  type: "dm" | "group";
  participants: { id: string; name: string }[];
  groupName?: string; // 그룹 채팅인 경우
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

/**
 * 지역별 기본 그룹 채팅방
 * 강사가 가입 시 자동으로 해당 지역 채팅방에 참여
 */
export const REGIONAL_GROUPS: { region: string; name: string }[] = [
  { region: "seoul", name: "서울 강사 모임" },
  { region: "incheonGyeonggi", name: "경기/인천 강사 모임" },
  { region: "daejeonChungnam", name: "대전/충남 강사 모임" },
  { region: "busanGyeongnam", name: "부산/경남 강사 모임" },
  { region: "daeguGyeongbuk", name: "대구/경북 강사 모임" },
  { region: "gwangjuJeonnam", name: "광주/전남 강사 모임" },
  { region: "gangwon", name: "강원 강사 모임" },
  { region: "jeju", name: "제주 강사 모임" },
];
