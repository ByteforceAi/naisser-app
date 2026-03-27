import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, and, lt, gte, sql, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const boardType = searchParams.get("boardType") || "all";
  const boardRef = searchParams.get("ref");
  const cursor = searchParams.get("cursor");
  const region = searchParams.get("region");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  try {
    let posts;

    // ═══ HOT 카테고리: 특별 알고리즘 ═══
    if (category === "hot") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      posts = await db
        .select()
        .from(schema.communityPosts)
        .where(
          and(
            eq(schema.communityPosts.boardType, boardType),
            gte(schema.communityPosts.createdAt, sevenDaysAgo)
          )
        )
        .orderBy(
          desc(
            sql`(${schema.communityPosts.helpfulCount} * 3 + ${schema.communityPosts.likeCount} * 2 + ${schema.communityPosts.commentCount})`
          )
        )
        .limit(20);
    } else {
      // ═══ 일반 카테고리 피드 ═══
      const conditions = [eq(schema.communityPosts.boardType, boardType)];

      if (category) {
        conditions.push(eq(schema.communityPosts.category, category));
      }

      if (boardRef) {
        conditions.push(eq(schema.communityPosts.boardRef, boardRef));
      }

      if (cursor) {
        conditions.push(lt(schema.communityPosts.createdAt, new Date(cursor)));
      }

      posts = await db
        .select()
        .from(schema.communityPosts)
        .where(and(...conditions))
        .orderBy(desc(schema.communityPosts.createdAt))
        .limit(limit + 1);
    }

    // ═══ 지역 필터링 (author의 region 기반) ═══
    if (region && posts.length > 0) {
      const authorIds = Array.from(new Set(posts.map((p) => p.authorId)));

      // 강사 region 조회
      const instructorRows = await db
        .select({ userId: schema.instructors.userId, regions: schema.instructors.regions })
        .from(schema.instructors)
        .where(inArray(schema.instructors.userId, authorIds));

      // 교사 region 조회
      const teacherRows = await db
        .select({ userId: schema.teachers.userId, region: schema.teachers.region })
        .from(schema.teachers)
        .where(inArray(schema.teachers.userId, authorIds));

      const regionMatchUserIds = new Set<string>();

      for (const row of instructorRows) {
        if (row.userId && row.regions?.includes(region)) {
          regionMatchUserIds.add(row.userId);
        }
      }
      for (const row of teacherRows) {
        if (row.userId && row.region === region) {
          regionMatchUserIds.add(row.userId);
        }
      }

      posts = posts.filter((p) => regionMatchUserIds.has(p.authorId));
    }

    // ═══ 페이지네이션 처리 (hot은 별도) ═══
    let hasMore = false;
    let data = posts;
    if (category !== "hot") {
      hasMore = posts.length > limit;
      data = hasMore ? posts.slice(0, limit) : posts;
    }

    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].createdAt?.toISOString() ?? null
        : null;

    // ═══ 반익명 프로필 정보 조인 ═══
    if (data.length > 0) {
      const authorIds = Array.from(new Set(data.map((p) => p.authorId)));

      const instructorProfiles = await db
        .select({
          userId: schema.instructors.userId,
          topics: schema.instructors.topics,
          regions: schema.instructors.regions,
        })
        .from(schema.instructors)
        .where(inArray(schema.instructors.userId, authorIds));

      const profileMap = new Map<string, { topics: string[]; regions: string[] }>();
      for (const row of instructorProfiles) {
        if (row.userId) {
          profileMap.set(row.userId, { topics: row.topics, regions: row.regions });
        }
      }

      // ═══ 커뮤니티 등급 조회 ═══
      const gradeRows = await db
        .select({
          userId: schema.userCommunityScores.userId,
          grade: schema.userCommunityScores.grade,
        })
        .from(schema.userCommunityScores)
        .where(inArray(schema.userCommunityScores.userId, authorIds));

      const gradeMap = new Map<string, string>();
      for (const row of gradeRows) {
        gradeMap.set(row.userId, row.grade);
      }

      // ═══ 인라인 답글 미리보기 (각 post의 최신 댓글 2개) ═══
      const postIds = data.map((p) => p.id);
      const allComments = await db
        .select()
        .from(schema.communityComments)
        .where(inArray(schema.communityComments.postId, postIds))
        .orderBy(desc(schema.communityComments.createdAt));

      // 댓글 작성자 프로필 조회
      const commentAuthorIds = Array.from(new Set(allComments.map((c) => c.authorId)));
      const commentProfileMap = new Map<string, { topics: string[]; regions: string[] }>();
      if (commentAuthorIds.length > 0) {
        const commentInstructorProfiles = await db
          .select({
            userId: schema.instructors.userId,
            topics: schema.instructors.topics,
            regions: schema.instructors.regions,
          })
          .from(schema.instructors)
          .where(inArray(schema.instructors.userId, commentAuthorIds));

        for (const row of commentInstructorProfiles) {
          if (row.userId) {
            commentProfileMap.set(row.userId, { topics: row.topics, regions: row.regions });
          }
        }
      }

      // postId별로 최신 2개씩 그룹핑
      const commentsByPost = new Map<string, typeof allComments>();
      for (const c of allComments) {
        const existing = commentsByPost.get(c.postId) || [];
        if (existing.length < 2) {
          existing.push(c);
          commentsByPost.set(c.postId, existing);
        }
      }

      // ═══ 최종 데이터 매핑 ═══
      const enrichedData = data.map((post) => {
        const profile = profileMap.get(post.authorId);
        const previewComments = (commentsByPost.get(post.id) || []).map((c) => {
          const cProfile = commentProfileMap.get(c.authorId);
          return {
            id: c.id,
            authorId: c.authorId,
            content: c.content,
            authorTopics: cProfile?.topics,
            authorRegions: cProfile?.regions,
          };
        });

        return {
          ...post,
          authorTopics: profile?.topics,
          authorRegions: profile?.regions,
          authorGrade: gradeMap.get(post.authorId) || "sprout",
          helpfulCount: post.helpfulCount ?? 0,
          previewComments,
        };
      });

      return NextResponse.json({
        data: enrichedData,
        pagination: { nextCursor, limit, hasMore },
      });
    }

    return NextResponse.json({
      data: [],
      pagination: { nextCursor: null, limit, hasMore: false },
    });
  } catch (error) {
    console.error("피드 조회 실패:", error);
    return NextResponse.json(
      { error: "피드를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
