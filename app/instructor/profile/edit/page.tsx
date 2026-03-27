"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Plus,
  X,
  Loader2,
  Link as LinkIcon,
  Award,
  CheckCircle2,
} from "lucide-react";
import { getCategoryLabel } from "@/lib/constants/categories";

/* ─── 타입 ─── */
interface InstructorProfile {
  id: string;
  userId?: string;
  instructorName: string;
  phone: string;
  profileImage: string | null;
  topics: string[];
  methods: string[];
  regions: string[];
  bio: string | null;
  career: string | null;
  certifications: string[] | null;
  portfolioLinks: string[] | null;
}

/* ─── 애니메이션 ─── */
const staggerContainer: import("framer-motion").Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const slideUp: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ─── 글래스 인풋 스타일 ─── */
const glassInputClass = `
  w-full px-4 py-3 rounded-xl text-sm
  bg-[rgba(255,255,255,0.65)] backdrop-blur-[12px]
  border-[1.5px] border-[rgba(0,0,0,0.06)]
  outline-none transition-all duration-200
  focus:border-[#3B6CF6] focus:shadow-[0_0_0_3px_rgba(59,108,246,0.2)]
  placeholder:text-[var(--text-muted)]
`.replace(/\n/g, " ").trim();

const glassInputReadonlyClass = `
  w-full px-4 py-3 rounded-xl text-sm
  bg-[rgba(0,0,0,0.03)] backdrop-blur-[12px]
  border-[1.5px] border-[rgba(0,0,0,0.04)]
  text-[var(--text-secondary)] cursor-not-allowed
`.replace(/\n/g, " ").trim();

/* ─── 메인 컴포넌트 ─── */
export default function InstructorProfileEditPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상태
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [profile, setProfile] = useState<InstructorProfile | null>(null);

  // 편집 상태
  const [bio, setBio] = useState("");
  const [career, setCareer] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 프로필 완성도
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (profile?.instructorName) score += 20;
    if (profile?.topics?.length) score += 20;
    if (bio.trim()) score += 20;
    if (career.trim()) score += 15;
    if (profileImage) score += 15;
    if (certifications.filter((c) => c.trim()).length) score += 10;
    return score;
  }, [profile, bio, career, profileImage, certifications]);

  // 토스트 자동 숨김
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // 프로필 데이터 로드
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/instructors?limit=1&status=");
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();

        const mine = json.data?.find(
          (inst: InstructorProfile) => inst.userId === session?.user?.id
        );
        const data: InstructorProfile | undefined = mine || json.data?.[0];
        if (!data) return;

        setProfile(data);
        setBio(data.bio || "");
        setCareer(data.career || "");
        setCertifications(data.certifications?.length ? data.certifications : []);
        setPortfolioLinks(data.portfolioLinks?.length ? data.portfolioLinks : []);
        setProfileImage(data.profileImage || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) load();
  }, [session?.user?.id]);

  // 로그인 체크
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [sessionStatus, router]);

  // 이미지 업로드
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload/profile", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
          setToast(json.error || "이미지 업로드에 실패했습니다.");
          return;
        }

        setProfileImage(json.data.url);
        setToast("프로필 사진이 변경되었습니다.");
      } catch {
        setToast("이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    []
  );

  // 자격증 관리
  const addCertification = () => setCertifications((prev) => [...prev, ""]);
  const removeCertification = (idx: number) =>
    setCertifications((prev) => prev.filter((_, i) => i !== idx));
  const updateCertification = (idx: number, val: string) =>
    setCertifications((prev) => prev.map((c, i) => (i === idx ? val : c)));

  // 포트폴리오 관리
  const addPortfolioLink = () => setPortfolioLinks((prev) => [...prev, ""]);
  const removePortfolioLink = (idx: number) =>
    setPortfolioLinks((prev) => prev.filter((_, i) => i !== idx));
  const updatePortfolioLink = (idx: number, val: string) =>
    setPortfolioLinks((prev) => prev.map((l, i) => (i === idx ? val : l)));

  // 저장
  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);

    try {
      const body: Record<string, unknown> = {};

      if (bio !== (profile.bio || "")) body.bio = bio.trim() || null;
      if (career !== (profile.career || "")) body.career = career.trim() || null;
      if (profileImage !== profile.profileImage) body.profileImage = profileImage;

      const cleanedCerts = certifications.filter((c) => c.trim());
      const origCerts = profile.certifications || [];
      if (JSON.stringify(cleanedCerts) !== JSON.stringify(origCerts)) {
        body.certifications = cleanedCerts;
      }

      const cleanedLinks = portfolioLinks.filter((l) => l.trim());
      const origLinks = profile.portfolioLinks || [];
      if (JSON.stringify(cleanedLinks) !== JSON.stringify(origLinks)) {
        body.portfolioLinks = cleanedLinks;
      }

      if (Object.keys(body).length === 0) {
        setToast("변경된 내용이 없습니다.");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/instructors/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        setToast(json.error || "저장에 실패했습니다.");
        return;
      }

      setToast("프로필이 저장되었습니다.");
      setTimeout(() => router.push("/instructor"), 800);
    } catch {
      setToast("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /* ─── 스켈레톤 ─── */
  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#F8F9FC]">
        <div className="max-w-[520px] mx-auto px-4 pt-6">
          {/* 헤더 스켈레톤 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-6 w-28 rounded-lg bg-gray-200 animate-pulse" />
          </div>
          {/* 프로그레스 스켈레톤 */}
          <div className="h-3 rounded-full bg-gray-200 animate-pulse mb-8" />
          {/* 아바타 스켈레톤 */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
          </div>
          {/* 카드 스켈레톤 */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-gray-200 animate-pulse mb-4"
            />
          ))}
        </div>
      </div>
    );
  }

  const initials = (profile?.instructorName || "?")[0];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <div className="max-w-[520px] mx-auto px-4 pt-6 pb-32">
        {/* ─── 상단 헤더 ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-5"
        >
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl flex items-center justify-center
                       bg-white/70 backdrop-blur-md border border-[rgba(0,0,0,0.06)]
                       transition-all duration-200 active:scale-95 touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">프로필 편집</h1>
        </motion.div>

        {/* ─── 완성도 바 ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              프로필 완성도
            </span>
            <span className="text-xs font-bold text-[#3B6CF6]">
              {completionPercentage}% 완성
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[rgba(0,0,0,0.06)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#3B6CF6] to-[#6D9CFF]"
            />
          </div>
        </motion.div>

        {/* ─── 프로필 사진 ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center
                         border-[2px] border-white shadow-lg"
              style={
                profileImage
                  ? {}
                  : {
                      background:
                        "linear-gradient(135deg, #3B6CF6 0%, #6D9CFF 100%)",
                    }
              }
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">{initials}</span>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                       text-[#3B6CF6] bg-[#3B6CF6]/10 transition-all duration-200
                       active:scale-95 disabled:opacity-50 touch-target"
          >
            <Camera className="w-3.5 h-3.5" />
            사진 변경
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </motion.div>

        {/* ─── 섹션 카드들 (stagger) ─── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* 1. 기본 정보 (읽기 전용) */}
          <motion.section variants={slideUp} className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4 text-[var(--text-primary)]">
              기본 정보
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  강사명
                </label>
                <div className={glassInputReadonlyClass}>
                  {profile?.instructorName || "-"}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  전화번호
                </label>
                <div className={glassInputReadonlyClass}>
                  {profile?.phone || "-"}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  강의주제
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.topics?.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[#3B6CF6] font-medium"
                    >
                      {getCategoryLabel(t, "subject")}
                    </span>
                  )) || (
                    <span className="text-xs text-[var(--text-muted)]">-</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  활동지역
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.regions?.map((r) => (
                    <span
                      key={r}
                      className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium"
                    >
                      {getCategoryLabel(r, "region")}
                    </span>
                  )) || (
                    <span className="text-xs text-[var(--text-muted)]">-</span>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          {/* 2. 소개글 */}
          <motion.section variants={slideUp} className="glass-card p-5">
            <h3 className="text-sm font-bold mb-3 text-[var(--text-primary)]">
              소개글
            </h3>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                maxLength={500}
                rows={4}
                placeholder="학교에 보여질 간단한 소개를 작성해주세요. 어떤 수업을 하시는지, 강사로서의 강점을 알려주세요."
                className={`${glassInputClass} resize-none leading-relaxed`}
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-[var(--text-muted)]">
                {bio.length}/500
              </span>
            </div>
          </motion.section>

          {/* 3. 경력 */}
          <motion.section variants={slideUp} className="glass-card p-5">
            <h3 className="text-sm font-bold mb-3 text-[var(--text-primary)]">
              경력
            </h3>
            <div className="relative">
              <textarea
                value={career}
                onChange={(e) => setCareer(e.target.value.slice(0, 1000))}
                maxLength={1000}
                rows={4}
                placeholder={
                  "주요 경력을 작성해주세요.\n예: OO교육원 5년 근무, OO학교 특강 100회 이상"
                }
                className={`${glassInputClass} resize-none leading-relaxed`}
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-[var(--text-muted)]">
                {career.length}/1000
              </span>
            </div>
          </motion.section>

          {/* 4. 자격증 */}
          <motion.section variants={slideUp} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#3B6CF6]" />
                자격증
              </h3>
              <button
                onClick={addCertification}
                className="flex items-center gap-1 text-xs font-semibold text-[#3B6CF6]
                           px-3 py-1.5 rounded-lg bg-[#3B6CF6]/10
                           transition-all duration-200 active:scale-95 touch-target"
              >
                <Plus className="w-3.5 h-3.5" />
                추가
              </button>
            </div>
            <AnimatePresence mode="popLayout">
              {certifications.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-[var(--text-muted)] py-2"
                >
                  등록된 자격증이 없습니다. 추가 버튼을 눌러주세요.
                </motion.p>
              )}
              {certifications.map((cert, idx) => (
                <motion.div
                  key={`cert-${idx}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => updateCertification(idx, e.target.value)}
                    placeholder="자격증명 (예: 안전교육지도사 1급)"
                    className={`${glassInputClass} flex-1`}
                  />
                  <button
                    onClick={() => removeCertification(idx)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                               text-red-400 hover:bg-red-50 transition-colors duration-200 touch-target"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.section>

          {/* 5. 포트폴리오 링크 */}
          <motion.section variants={slideUp} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-[#3B6CF6]" />
                포트폴리오 링크
              </h3>
              <button
                onClick={addPortfolioLink}
                className="flex items-center gap-1 text-xs font-semibold text-[#3B6CF6]
                           px-3 py-1.5 rounded-lg bg-[#3B6CF6]/10
                           transition-all duration-200 active:scale-95 touch-target"
              >
                <Plus className="w-3.5 h-3.5" />
                추가
              </button>
            </div>
            <AnimatePresence mode="popLayout">
              {portfolioLinks.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-[var(--text-muted)] py-2"
                >
                  등록된 포트폴리오가 없습니다. 추가 버튼을 눌러주세요.
                </motion.p>
              )}
              {portfolioLinks.map((link, idx) => (
                <motion.div
                  key={`link-${idx}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updatePortfolioLink(idx, e.target.value)}
                    placeholder="포트폴리오 URL (블로그, 유튜브 등)"
                    className={`${glassInputClass} flex-1`}
                  />
                  <button
                    onClick={() => removePortfolioLink(idx)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                               text-red-400 hover:bg-red-50 transition-colors duration-200 touch-target"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.section>
        </motion.div>

        {/* ─── 저장 버튼 (고정) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="fixed bottom-20 left-0 right-0 px-4 pb-4 pt-3 z-30
                     bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC] to-transparent"
        >
          <div className="max-w-[520px] mx-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white
                         bg-gradient-to-r from-[#3B6CF6] to-[#2553D4]
                         shadow-[0_4px_16px_rgba(59,108,246,0.3)]
                         transition-all duration-200 active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed touch-target
                         flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  저장하기
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── 토스트 ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50
                       px-5 py-3 rounded-2xl text-sm font-medium text-white
                       bg-[rgba(0,0,0,0.8)] backdrop-blur-md shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
