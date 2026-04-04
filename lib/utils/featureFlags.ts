/**
 * Feature Flags & A/B Testing
 *
 * 사용:
 *   if (isEnabled("new_feed_design")) { ... }
 *   const variant = getVariant("cta_color"); // "blue" | "green"
 */

interface FeatureFlag {
  id: string;
  enabled: boolean;
  rolloutPercent: number; // 0~100
  variants?: string[];    // A/B 변형
}

// 서버에서 가져올 수도 있지만, 초기에는 하드코딩
const FLAGS: FeatureFlag[] = [
  { id: "rich_text", enabled: true, rolloutPercent: 100 },
  { id: "link_preview", enabled: true, rolloutPercent: 100 },
  { id: "trending_tags", enabled: true, rolloutPercent: 100 },
  { id: "milestone_celebrations", enabled: true, rolloutPercent: 100 },
  { id: "ad_slots", enabled: true, rolloutPercent: 100 },
  { id: "thread_replies", enabled: true, rolloutPercent: 100 },
  { id: "dark_mode_auto", enabled: true, rolloutPercent: 100 },
  { id: "push_notifications", enabled: false, rolloutPercent: 0 }, // FCM 설정 후 활성화
  { id: "premium_profiles", enabled: false, rolloutPercent: 0 },   // 추후 모네타이제이션
];

function getUserBucket(): number {
  // 유저별 고정 버킷 (0~99)
  try {
    let bucket = parseInt(localStorage.getItem("naisser_ab_bucket") || "-1");
    if (bucket < 0) {
      bucket = Math.floor(Math.random() * 100);
      localStorage.setItem("naisser_ab_bucket", String(bucket));
    }
    return bucket;
  } catch {
    return Math.floor(Math.random() * 100);
  }
}

export function isEnabled(flagId: string): boolean {
  const flag = FLAGS.find((f) => f.id === flagId);
  if (!flag) return false;
  if (!flag.enabled) return false;
  if (flag.rolloutPercent >= 100) return true;
  return getUserBucket() < flag.rolloutPercent;
}

export function getVariant(flagId: string): string | null {
  const flag = FLAGS.find((f) => f.id === flagId);
  if (!flag?.variants?.length) return null;
  const bucket = getUserBucket();
  const idx = bucket % flag.variants.length;
  return flag.variants[idx];
}
