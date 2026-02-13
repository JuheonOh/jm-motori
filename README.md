# JM MOTORI SPA (요약본)

BMW/MINI 전문 정비소 JM MOTORI의 공식 랜딩 SPA 프로젝트입니다.  
실제 매장 정보와 네이버 블로그 정비 사례를 연결해 신뢰도와 방문 전환을 높이는 것이 목표입니다.

상세 명세서는 `docs/JM_MOTORI_SPA_SPEC_v1.9.md`를 참고하세요.

## 1. 프로젝트 핵심

1. 광주 지역 BMW/MINI 정비 전문성 시각화
2. 모바일 기준 전화/길안내 즉시 연결
3. 블로그 포트폴리오 자동 최신화

## 2. 주요 기능

1. 고정 네비게이션 + 전화 CTA
2. 히어로 섹션(핵심 메시지/CTA)
3. 정비 서비스 카드 섹션
4. 최신 정비 사례 카드(RSS 기반, 더보기/재시도)
5. 매장 정보 + 지도 + T맵/카카오내비/네이버지도 연결

## 3. 기술 스택

1. React 18
2. Vite 6
3. Tailwind CSS v4 (`@tailwindcss/vite`)
4. GitHub Actions + GitHub Pages 배포

## 4. 데이터 로딩 전략 (RSS)

포트폴리오 데이터는 아래 순서로 로드합니다.

1. 브라우저 localStorage 캐시
2. 정적 캐시 파일 `public/data/blog-feed.json`
3. 실시간 RSS 프록시(AllOrigins) fallback

정적 캐시 생성 스크립트:

```bash
npm run sync:rss
```

## 5. 실행 방법

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

## 6. 환경 변수

`VITE_NAVER_MAP_CLIENT_ID`를 설정하면 네이버 지도를 사용합니다.  
미설정 시 임베드 지도 fallback이 동작합니다.

## 7. 주요 구조

```text
src/
  components/
    blog/          # BlogCards
    layout/        # TopNav, Footer
    MapPanel.jsx
  hooks/           # useRssPosts, useBusinessStatus
  sections/        # Hero, Services, Portfolio, Contact
  utils/           # navigation.js
  App.jsx
```

## 8. 배포/운영

1. `main` push 시 GitHub Actions로 Pages 배포
2. 30분 주기 스케줄로 RSS 캐시 자동 동기화

## 9. 다음 개선 후보

1. RSS 파서 인코딩 안정성 강화
2. 카드 필터/검색 기능
3. 접근성 자동 점검(axe) CI 도입
