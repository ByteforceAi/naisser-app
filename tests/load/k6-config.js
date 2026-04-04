/**
 * k6 로드 테스트 설정
 *
 * 실행: k6 run tests/load/k6-config.js
 * 설치: brew install k6 / choco install k6
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },   // 50명까지 증가
    { duration: "1m", target: 100 },    // 100명 유지
    { duration: "1m", target: 200 },    // 200명까지
    { duration: "2m", target: 200 },    // 200명 유지
    { duration: "30s", target: 0 },     // 종료
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% 요청이 2초 이내
    http_req_failed: ["rate<0.01"],     // 실패율 1% 미만
  },
};

const BASE_URL = __ENV.BASE_URL || "https://naisser.ai.kr";

export default function () {
  // 1. 메인 페이지
  const mainRes = http.get(`${BASE_URL}/`);
  check(mainRes, { "main 200": (r) => r.status === 200 });

  // 2. 커뮤니티 피드 API
  const feedRes = http.get(`${BASE_URL}/api/community/feed?limit=20&boardType=all&category=hot`);
  check(feedRes, {
    "feed 200": (r) => r.status === 200,
    "feed has data": (r) => {
      try { return JSON.parse(r.body).data !== undefined; } catch { return false; }
    },
  });

  // 3. 강사 목록
  const instructorsRes = http.get(`${BASE_URL}/api/instructors?limit=20`);
  check(instructorsRes, { "instructors 200": (r) => r.status === 200 });

  // 4. 검색
  const searchRes = http.get(`${BASE_URL}/api/community/search?q=흡연예방`);
  check(searchRes, { "search 200": (r) => r.status === 200 });

  sleep(1); // 유저 간 1초 간격
}
