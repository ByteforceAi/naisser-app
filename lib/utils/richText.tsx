import React from "react";

/**
 * renderRichText — 경량 리치 텍스트 렌더러
 *
 * 지원:
 * - **굵게** → <strong>
 * - @멘션 → 파란색 링크
 * - #해시태그 → 파란색
 * - URL → 클릭 가능 링크
 * - > 인용 → 왼쪽 보더 인용 블록
 * - - 리스트 → 불릿
 */
export function renderRichText(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    // 인용 (> )
    if (line.startsWith("> ")) {
      elements.push(
        <div key={lineIdx} className="border-l-2 border-[var(--accent-primary)]/30 pl-3 my-1 text-[var(--text-secondary)] italic">
          {processInline(line.slice(2))}
        </div>
      );
      return;
    }

    // 리스트 (- )
    if (line.startsWith("- ")) {
      elements.push(
        <div key={lineIdx} className="flex gap-2 my-0.5">
          <span className="text-[var(--text-muted)] shrink-0">•</span>
          <span>{processInline(line.slice(2))}</span>
        </div>
      );
      return;
    }

    // 일반 텍스트
    if (line.trim() === "") {
      elements.push(<br key={lineIdx} />);
    } else {
      elements.push(
        <span key={lineIdx}>
          {processInline(line)}
          {lineIdx < lines.length - 1 && "\n"}
        </span>
      );
    }
  });

  return elements;
}

function processInline(text: string): React.ReactNode[] {
  // 순서: **bold** → @mention → #hashtag → URL
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // **bold**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // @mention
    const mentionMatch = remaining.match(/@(\S+)/);
    // #hashtag
    const hashMatch = remaining.match(/#(\S+)/);
    // URL
    const urlMatch = remaining.match(/(https?:\/\/\S+)/);

    // 가장 먼저 나오는 매치 찾기
    const matches = [
      boldMatch && { type: "bold", match: boldMatch },
      mentionMatch && { type: "mention", match: mentionMatch },
      hashMatch && { type: "hash", match: hashMatch },
      urlMatch && { type: "url", match: urlMatch },
    ].filter(Boolean).sort((a, b) => (a!.match.index || 0) - (b!.match.index || 0));

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const matchIdx = first.match.index || 0;

    // 매치 전 텍스트
    if (matchIdx > 0) {
      parts.push(remaining.slice(0, matchIdx));
    }

    // 매치 처리
    switch (first.type) {
      case "bold":
        parts.push(<strong key={idx++} className="font-bold">{first.match[1]}</strong>);
        remaining = remaining.slice(matchIdx + first.match[0].length);
        break;
      case "mention":
        parts.push(
          <span key={idx++} className="text-[var(--accent-primary)] font-semibold cursor-pointer hover:underline">
            @{first.match[1]}
          </span>
        );
        remaining = remaining.slice(matchIdx + first.match[0].length);
        break;
      case "hash":
        parts.push(
          <span key={idx++} className="text-[var(--text-secondary)]">
            #{first.match[1]}
          </span>
        );
        remaining = remaining.slice(matchIdx + first.match[0].length);
        break;
      case "url":
        parts.push(
          <a key={idx++} href={first.match[1]} target="_blank" rel="noopener noreferrer"
            className="text-[var(--accent-primary)] hover:underline break-all">
            {first.match[1].length > 40 ? first.match[1].slice(0, 40) + "…" : first.match[1]}
          </a>
        );
        remaining = remaining.slice(matchIdx + first.match[0].length);
        break;
    }
  }

  return parts;
}
