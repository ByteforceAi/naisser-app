"use client";

import { useState } from "react";
import { Search, Filter, Star, MapPin, Eye, ChevronRight } from "lucide-react";
import { SUBJECT_CATEGORIES } from "@/lib/constants/categories";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";

// ─── 더미 강사 데이터 (DB 연결 전) ───
const DUMMY_INSTRUCTORS = [
  {
    id: "1",
    name: "김예술",
    profileImage: null,
    topics: ["environmentEcology", "cookingBaking"],
    topicLabels: ["환경&생태", "요리&베이킹"],
    methods: ["craft", "practiceExperience"],
    methodLabels: ["공예", "실습체험"],
    regions: ["metropolitan"],
    regionLabel: "수도권",
    bio: "10년 경력의 환경교육 전문 강사입니다. 아이들이 자연을 사랑하는 마음을 기를 수 있도록 체험 중심 수업을 진행합니다.",
    rating: 4.8,
    reviewCount: 15,
    isEarlyBird: true,
  },
  {
    id: "2",
    name: "이코딩",
    profileImage: null,
    topics: ["aiDigital"],
    topicLabels: ["AI디지털"],
    methods: ["practiceExperience", "lecture"],
    methodLabels: ["실습체험", "강의"],
    regions: ["daejeonChungnam"],
    regionLabel: "대전충남",
    bio: "AI와 코딩을 재미있게 가르치는 IT 전문 강사. 스크래치부터 파이썬까지 학년별 맞춤 커리큘럼을 운영합니다.",
    rating: 4.9,
    reviewCount: 23,
    isEarlyBird: true,
  },
  {
    id: "3",
    name: "박체육",
    profileImage: null,
    topics: ["sportsPhysical"],
    topicLabels: ["체육&신체활동"],
    methods: ["practiceExperience"],
    methodLabels: ["실습체험"],
    regions: ["busanGyeongnam"],
    regionLabel: "부산경남",
    bio: "즐거운 체육 수업! 뉴스포츠와 전통놀이를 접목한 특색 있는 프로그램을 운영합니다.",
    rating: 4.7,
    reviewCount: 8,
    isEarlyBird: false,
  },
  {
    id: "4",
    name: "최마술",
    profileImage: null,
    topics: ["smokingPrevention", "characterBullying"],
    topicLabels: ["흡연예방", "인성&학폭,자살예방"],
    methods: ["magic", "performance"],
    methodLabels: ["마술", "공연"],
    regions: ["metropolitan", "gangwon"],
    regionLabel: "수도권",
    bio: "마술을 활용한 흡연예방, 인성교육 전문. 아이들이 웃으면서 배우는 공연형 수업입니다.",
    rating: 4.6,
    reviewCount: 12,
    isEarlyBird: false,
  },
  {
    id: "5",
    name: "정과학",
    profileImage: null,
    topics: ["science"],
    topicLabels: ["과학"],
    methods: ["practiceExperience", "lecture"],
    methodLabels: ["실습체험", "강의"],
    regions: ["daeguGyeongbuk"],
    regionLabel: "대구경북",
    bio: "과학실험 전문 강사. STEAM 교육 기반의 흥미진진한 실험 수업으로 과학적 사고력을 키워드립니다.",
    rating: 4.5,
    reviewCount: 6,
    isEarlyBird: true,
  },
  {
    id: "6",
    name: "한동화",
    profileImage: null,
    topics: ["readingWriting"],
    topicLabels: ["독서&글쓰기"],
    methods: ["storytelling", "debateDiscussion"],
    methodLabels: ["동화구연", "토의토론"],
    regions: ["gwangjuJeonnam"],
    regionLabel: "광주전남",
    bio: "그림책과 함께하는 독서교육 전문가. 동화구연과 토론을 결합한 깊이 있는 수업을 진행합니다.",
    rating: 4.9,
    reviewCount: 19,
    isEarlyBird: false,
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function TeacherHomePage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // 필터링
  const filtered = selectedTopic
    ? DUMMY_INSTRUCTORS.filter((inst) => inst.topics.includes(selectedTopic))
    : DUMMY_INSTRUCTORS;

  return (
    <div className="pt-4">
      {/* 헤더 */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">강사 찾기</h1>
          {!isLoggedIn && (
            <Link
              href="/auth/select-role"
              className="text-xs text-[var(--accent-primary)] font-medium hover:underline"
            >
              로그인 →
            </Link>
          )}
        </div>

        {/* 검색바 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              placeholder="강사명, 주제로 검색"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--glass-border)]
                         bg-[var(--bg-surface)] text-sm
                         focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30
                         focus:border-[var(--accent-primary)]"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl
                             border border-[var(--glass-border)] bg-[var(--bg-surface)] touch-target">
            <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* 카테고리 가로 스크롤 */}
      <div className="px-4 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`bubble-chip whitespace-nowrap ${!selectedTopic ? "selected" : ""}`}
          >
            전체
          </button>
          {SUBJECT_CATEGORIES.slice(0, -1).map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedTopic(cat.id === selectedTopic ? null : cat.id)
              }
              className={`bubble-chip whitespace-nowrap ${
                selectedTopic === cat.id ? "selected" : ""
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 강사 목록 */}
      <div className="px-4 pb-4">
        <p className="text-xs text-[var(--text-muted)] mb-3">
          {filtered.length}명의 강사
        </p>

        <AnimatePresence mode="popLayout">
          <motion.div className="space-y-3" layout>
            {filtered.map((inst, i) => (
              <motion.div
                key={inst.id}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: i * 0.05 }}
                layout
                className="glass-card p-4"
              >
                {/* 상단: 프로필 + 이름 */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center
                                  text-base font-semibold text-[var(--text-secondary)] shrink-0">
                    {inst.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{inst.name}</h3>
                      {inst.isEarlyBird && (
                        <span className="text-xs" title="얼리버드">🐣</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {inst.regionLabel}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{inst.rating}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      ({inst.reviewCount})
                    </span>
                  </div>
                </div>

                {/* 카테고리 태그 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {inst.topicLabels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-[var(--accent-primary)]"
                    >
                      {label}
                    </span>
                  ))}
                  {inst.methodLabels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* 소개 */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">
                  {inst.bio}
                </p>

                {/* 하단 */}
                <div className="flex items-center justify-between">
                  {isLoggedIn ? (
                    <button className="flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)]
                                       hover:underline">
                      상세보기 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Eye className="w-3.5 h-3.5" />
                      로그인 후 연락처 확인
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
