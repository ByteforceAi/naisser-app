/**
 * 시즌 테마 시스템
 *
 * 시기별로 UI 액센트 색상/배경을 자동 변경
 * 크리스마스, 새학기, 어린이날, 스승의날 등
 */

export interface SeasonTheme {
  id: string;
  name: string;
  startDate: string; // MM-DD
  endDate: string;   // MM-DD
  accentColor?: string;
  bgGradient?: string;
  badge?: string; // 시즌 뱃지 텍스트
}

export const SEASON_THEMES: SeasonTheme[] = [
  {
    id: "new_year",
    name: "새해",
    startDate: "01-01",
    endDate: "01-07",
    badge: "새해",
  },
  {
    id: "new_semester",
    name: "새학기",
    startDate: "03-01",
    endDate: "03-15",
    accentColor: "#10B981",
    badge: "새학기",
  },
  {
    id: "teachers_day",
    name: "스승의 날",
    startDate: "05-10",
    endDate: "05-20",
    accentColor: "#8B5CF6",
    badge: "스승의날",
  },
  {
    id: "summer",
    name: "여름방학",
    startDate: "07-20",
    endDate: "08-25",
    badge: "방학",
  },
  {
    id: "fall_semester",
    name: "2학기",
    startDate: "09-01",
    endDate: "09-10",
    accentColor: "#F59E0B",
    badge: "2학기",
  },
  {
    id: "christmas",
    name: "크리스마스",
    startDate: "12-20",
    endDate: "12-31",
    accentColor: "#EF4444",
    badge: "연말",
  },
];

export function getCurrentSeasonTheme(): SeasonTheme | null {
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return SEASON_THEMES.find((t) => mmdd >= t.startDate && mmdd <= t.endDate) || null;
}
