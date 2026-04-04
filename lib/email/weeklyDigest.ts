/**
 * 주간 이메일 다이제스트 생성
 *
 * 매주 월요일 오전 9시 cron으로 실행
 * 지난 7일간 인기 게시글 5개 + 활동 요약
 */

interface DigestData {
  userName: string;
  topPosts: { title: string; author: string; likeCount: number; url: string }[];
  myStats: {
    newLikes: number;
    newComments: number;
    newHelpfuls: number;
  };
  weekNumber: number;
}

export function generateDigestHTML(data: DigestData): string {
  const postsList = data.topPosts
    .map((p, i) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-size: 12px; color: #9ca3af;">${i + 1}</span>
          <a href="${p.url}" style="font-size: 14px; color: #1a1a1a; text-decoration: none; font-weight: 600; margin-left: 8px;">
            ${p.title.slice(0, 50)}${p.title.length > 50 ? "..." : ""}
          </a>
          <br/>
          <span style="font-size: 12px; color: #6b7280; margin-left: 20px;">
            ${p.author} · 좋아요 ${p.likeCount}
          </span>
        </td>
      </tr>
    `)
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family: -apple-system, sans-serif; background: #f9fafb; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 12px; font-weight: 700; color: #2563eb; letter-spacing: 0.15em;">NAISSER</span>
      <h1 style="font-size: 18px; color: #1a1a1a; margin: 8px 0 4px;">주간 다이제스트</h1>
      <p style="font-size: 12px; color: #9ca3af;">제${data.weekNumber}주차</p>
    </div>

    <p style="font-size: 14px; color: #374151; margin-bottom: 20px;">
      ${data.userName}님, 이번 주 강사 라운지의 인기 글이에요.
    </p>

    <table style="width: 100%; border-collapse: collapse;">
      ${postsList}
    </table>

    ${data.myStats.newLikes > 0 || data.myStats.newComments > 0 ? `
    <div style="margin-top: 24px; padding: 16px; background: #f8f9fc; border-radius: 12px;">
      <p style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px;">이번 주 내 활동</p>
      <p style="font-size: 13px; color: #6b7280;">
        좋아요 ${data.myStats.newLikes}개 · 댓글 ${data.myStats.newComments}개 · 도움 ${data.myStats.newHelpfuls}개
      </p>
    </div>
    ` : ""}

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://naisser.ai.kr/community"
         style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white;
                font-size: 14px; font-weight: 600; border-radius: 12px; text-decoration: none;">
        강사 라운지 바로가기
      </a>
    </div>

    <p style="font-size: 10px; color: #d1d5db; text-align: center; margin-top: 32px;">
      설정에서 이메일 수신을 해제할 수 있습니다.
    </p>
  </div>
</body>
</html>
  `.trim();
}
