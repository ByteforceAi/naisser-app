/**
 * NAISSER Design System — 마스터피스 레벨
 *
 * 모든 페이지에서 이 토큰을 import해서 사용.
 * "개발비 199억 든 것처럼" 보이려면 일관성이 핵심.
 */

// ═══════════════════════════════════════════
// 1. COLOR PALETTE
// ═══════════════════════════════════════════

export const colors = {
  // Primary
  brand: "#2563EB",
  brandLight: "#3B82F6",
  brandDark: "#1D4ED8",
  brandSoft: "rgba(37,99,235,0.08)",

  // Accent
  violet: "#7C3AED",
  emerald: "#059669",
  amber: "#D97706",

  // Neutral (Gray Scale)
  gray: {
    50: "#FAFBFC",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Semantic
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#2563EB",

  // Background
  bg: "#F8F9FC",
  surface: "rgba(255,255,255,0.7)",
  surfaceSolid: "#FFFFFF",

  // Glass
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(0,0,0,0.04)",
  glassBlur: "12px",
} as const;

// ═══════════════════════════════════════════
// 2. TYPOGRAPHY SCALE
// ═══════════════════════════════════════════

export const typography = {
  // Display — 히어로, 랜딩
  display: "text-[2rem] sm:text-[2.75rem] font-bold tracking-tight leading-[1.15]",

  // Heading
  h1: "text-2xl font-bold tracking-tight text-gray-900",          // 페이지 제목
  h2: "text-xl font-bold text-gray-900",                           // 섹션 제목
  h3: "text-base font-bold text-gray-900",                         // 카드 제목
  h4: "text-sm font-bold text-gray-900",                           // 서브 제목

  // Body
  body: "text-sm text-gray-700 leading-relaxed",                   // 본문
  bodySmall: "text-xs text-gray-500 leading-relaxed",              // 부연 설명

  // Label
  label: "text-xs font-semibold text-gray-500",                    // 폼 라벨
  labelUpper: "text-[10px] font-semibold tracking-widest uppercase text-blue-500", // 섹션 라벨

  // Caption
  caption: "text-[10px] text-gray-400",                            // 타임스탬프, 부가정보
  captionBold: "text-[10px] font-bold text-gray-500",              // 뱃지 텍스트

  // Number
  stat: "text-3xl font-black text-gray-900",                       // 통계 숫자
  statSmall: "text-lg font-bold text-gray-900",                    // 카드 내 숫자
} as const;

// ═══════════════════════════════════════════
// 3. SPACING RHYTHM (8pt grid)
// ═══════════════════════════════════════════

export const spacing = {
  page: "px-5",                    // 페이지 좌우 패딩
  sectionGap: "py-6",             // 섹션 간 세로 간격
  cardPadding: "p-5",             // 카드 내부 패딩
  cardGap: "gap-3",               // 카드 사이 간격
  elementGap: "gap-2",            // 요소 사이 간격
  bottomNav: "pb-24",             // 하단 네비 여백
  safeBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
} as const;

// ═══════════════════════════════════════════
// 4. CARD STYLES
// ═══════════════════════════════════════════

export const card = {
  // 기본 글래스 카드
  glass: {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0,0,0,0.04)",
    borderRadius: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  },
  // 강조 카드 (hover/선택)
  glassActive: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(16px)",
    border: "1.5px solid rgba(37,99,235,0.12)",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(37,99,235,0.08)",
  },
  // 투명 카드 (비활성)
  glassMuted: {
    background: "rgba(255,255,255,0.4)",
    border: "1px solid rgba(0,0,0,0.02)",
    borderRadius: "20px",
  },
} as const;

// ═══════════════════════════════════════════
// 5. BUTTON STYLES
// ═══════════════════════════════════════════

export const button = {
  primary: "text-sm font-bold text-white rounded-2xl transition-all",
  primaryBg: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
  primaryShadow: "0 4px 16px rgba(59,108,246,0.3)",

  secondary: "text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl",

  ghost: "text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors",

  chip: "text-xs font-medium px-3 py-1.5 rounded-xl transition-all",
  chipActive: "bg-blue-500 text-white shadow-md",
  chipInactive: "bg-white border border-gray-200 text-gray-600",
} as const;

// ═══════════════════════════════════════════
// 6. ANIMATION PRESETS (framer-motion)
// ═══════════════════════════════════════════

export const motion = {
  // 페이지 진입
  pageEnter: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },

  // 카드 등장 (stagger parent)
  stagger: {
    visible: { transition: { staggerChildren: 0.04 } },
  },

  // 카드 단일 (stagger child)
  fadeInUp: {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  },

  // 바텀시트
  sheet: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "spring" as const, stiffness: 340, damping: 28 },
  },

  // 탭 전환
  tabSwitch: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  },

  // 터치 피드백
  tap: { scale: 0.97 },
  tapSmall: { scale: 0.95 },
  tapBounce: { scale: 0.92 },
} as const;

// ═══════════════════════════════════════════
// 7. TOPIC COLORS (주제별 고유 색상)
// ═══════════════════════════════════════════

export const topicColors: Record<string, string> = {
  환경: "#059669",
  생명존중: "#10B981",
  AI: "#6366F1",
  "AI디지털": "#6366F1",
  코딩: "#3B82F6",
  미술: "#EC4899",
  공예: "#F59E0B",
  체육: "#EF4444",
  음악: "#8B5CF6",
  진로: "#0891B2",
  독서: "#78716C",
  심리상담: "#6366F1",
  기타: "#6B7280",
};

export function getTopicColor(topic: string): string {
  return topicColors[topic] || "#3B82F6";
}

// ═══════════════════════════════════════════
// 8. LAYOUT CONSTANTS
// ═══════════════════════════════════════════

export const layout = {
  maxWidth: "max-w-lg mx-auto",     // 모바일 퍼스트 최대 너비
  headerHeight: "h-14",              // 상단 헤더 높이
  bottomNavHeight: "h-16",           // 하단 네비 높이
  touchTarget: "min-h-[44px] min-w-[44px]", // 터치 타겟 최소
} as const;
