/**
 * groupNotifications — 알림 그루핑 유틸
 *
 * "김하늘 외 3명이 좋아요를 눌렀습니다" 형태로 변환
 * 같은 postId + 같은 type의 알림을 묶음
 */

interface RawNotification {
  id: string;
  type: string; // "like" | "comment" | "helpful" | "mention" | "request"
  postId?: string;
  actorName: string;
  actorId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link: string | null;
}

export interface GroupedNotification {
  id: string;
  type: string;
  postId?: string;
  actors: { name: string; id: string }[];
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string; // 가장 최근
  link: string | null;
}

export function groupNotifications(raw: RawNotification[]): GroupedNotification[] {
  const groups = new Map<string, GroupedNotification>();

  for (const n of raw) {
    const key = `${n.type}:${n.postId || n.id}`;

    if (groups.has(key)) {
      const g = groups.get(key)!;
      g.actors.push({ name: n.actorName, id: n.actorId });
      if (!n.isRead) g.isRead = false;
      if (n.createdAt > g.createdAt) g.createdAt = n.createdAt;
    } else {
      groups.set(key, {
        id: n.id,
        type: n.type,
        postId: n.postId,
        actors: [{ name: n.actorName, id: n.actorId }],
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        link: n.link,
      });
    }
  }

  return Array.from(groups.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((g) => ({
      ...g,
      title: g.actors.length > 1
        ? `${g.actors[0].name} 외 ${g.actors.length - 1}명`
        : g.actors[0].name,
      message: formatGroupMessage(g.type, g.actors.length),
    }));
}

function formatGroupMessage(type: string, count: number): string {
  const suffix = count > 1 ? ` (${count}명)` : "";
  switch (type) {
    case "like": return `회원님의 글에 좋아요를 눌렀습니다${suffix}`;
    case "helpful": return `회원님의 글을 도움됐다고 했습니다${suffix}`;
    case "comment": return `회원님의 글에 답글을 남겼습니다${suffix}`;
    case "mention": return `회원님을 멘션했습니다`;
    case "request": return `수업 의뢰를 보냈습니다`;
    default: return "";
  }
}
