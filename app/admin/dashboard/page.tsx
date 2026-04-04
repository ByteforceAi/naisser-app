"use client";

import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  School,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── 통계 카드 ───
const STATS = [
  { label: "전체 강사", value: 127, change: "+12", icon: GraduationCap, color: "#60A5FA" },
  { label: "전체 교사", value: 89, change: "+8", icon: School, color: "#34D399" },
  { label: "이번 주 신규", value: 15, change: "+5", icon: TrendingUp, color: "#A78BFA" },
  { label: "활동중 강사", value: 68, change: "+3", icon: Users, color: "#F59E0B" },
];

// ─── 상태별 파이차트 데이터 ───
const STATUS_DATA = [
  { name: "신규", value: 45, color: "#60A5FA" },
  { name: "연락완료", value: 20, color: "#FBBF24" },
  { name: "활동중", value: 50, color: "#34D399" },
  { name: "비활성", value: 12, color: "#6B7280" },
];

// ─── 주간 트렌드 라인차트 데이터 ───
const TREND_DATA = [
  { week: "1주차", instructors: 8, teachers: 5 },
  { week: "2주차", instructors: 12, teachers: 9 },
  { week: "3주차", instructors: 15, teachers: 11 },
  { week: "4주차", instructors: 20, teachers: 14 },
  { week: "5주차", instructors: 18, teachers: 16 },
  { week: "6주차", instructors: 25, teachers: 20 },
  { week: "7주차", instructors: 22, teachers: 18 },
  { week: "이번주", instructors: 27, teachers: 22 },
];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboardPage() {
  return (
    <div className="page-bg-mesh page-bg-mesh-violet page-bg-dots p-4 lg:p-8 space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-2xl font-bold lg:ml-0 ml-12"
      >CRM 대시보드</motion.h1>

      {/* 통계 카드 그리드 */}
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.08 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {STATS.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeIn}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              <span className="text-xs font-medium text-[var(--accent-success)]">
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* 차트 영역 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* 상태별 파이차트 */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" as const }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">강사 상태 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {STATUS_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 주간 트렌드 라인차트 */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" as const }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">주간 가입 트렌드</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={{ stroke: "var(--glass-border)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={{ stroke: "var(--glass-border)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="instructors"
                  name="강사"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#60A5FA" }}
                />
                <Line
                  type="monotone"
                  dataKey="teachers"
                  name="교사"
                  stroke="#34D399"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#34D399" }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                      {value}
                    </span>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
