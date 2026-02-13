# JM MOTORI SPA 프로젝트 통합 명세서 (v1.9)

문서 버전: v1.9  
최종 수정일: 2026-02-13  
대상 저장소: `jm-motori`

## 1. 개요 (Overview)

### 1.1 프로젝트 개요

프로젝트명: JM MOTORI 공식 랜딩 페이지 (SPA)  
목적: 광주 지역 BMW/MINI 전문 정비소의 전문성, 신뢰성, 접근성을 웹에서 즉시 전달한다.  
핵심 목표:

1. 실제 매장 정보와 정비 사례를 한 화면 흐름으로 연결
2. 전화/내비 길안내 전환을 최소 클릭으로 제공
3. 블로그 기반 포트폴리오를 자동 최신화

### 1.2 타겟 사용자

1. 광주 광산구 및 인근 수입차 차주
2. MINI/BMW 오너 중 정비 이력과 신뢰도를 중시하는 사용자
3. 모바일에서 즉시 전화상담/길안내를 원하는 사용자

### 1.3 범위

포함 범위:

1. 랜딩 단일 페이지(섹션 스크롤)
2. 정비 서비스 소개
3. 네이버 블로그 RSS 기반 최신 사례 카드
4. 매장 정보/지도/내비게이션 버튼

제외 범위:

1. 회원가입/로그인
2. 온라인 예약 결제
3. 백오피스 관리자 화면

## 2. 기능 명세 (Functional Specifications)

### 2.1 주요 기능

1. 고정 상단 네비게이션
   - 사용자 동작: 메뉴 클릭, 전화 상담 버튼 클릭
   - 시스템 응답: 섹션 스크롤 이동, `tel:` 링크 실행

2. 히어로 섹션
   - 사용자 동작: “바로 전화”, “최신 정비 사례 보기” 클릭
   - 시스템 응답: 전화 앱 연결, 포트폴리오 섹션 이동

3. 정비 서비스 섹션
   - 사용자 동작: 서비스 카드 열람
   - 시스템 응답: 4개 핵심 서비스 정보 표시

4. 최신 정비 사례 섹션
   - 사용자 동작: 카드 클릭, “정비 사례 더보기” 클릭, 실패 시 재시도 클릭
   - 시스템 응답:
     1. 블로그 원문 이동
     2. 카드 노출 수 6개 단위 증가
     3. 에러 상태 메시지 및 재요청 수행
     4. 매장 정보/오시는 길 섹션
        - 사용자 동작: T맵/카카오내비/네이버지도 버튼 클릭
        - 시스템 응답:
     5. 딥링크 앱 호출
     6. 앱 미설치 또는 실패 시 웹 지도 fallback 열기
     7. 지도 패널
        - 사용자 동작: 지도 영역 확인
        - 시스템 응답:

5. `VITE_NAVER_MAP_CLIENT_ID` 존재 시 네이버 지도 렌더링
6. 미설정 시 임베드 지도 fallback 렌더링

### 2.2 화면 설계

1. `TopNav`
   - 로고, 섹션 앵커, 전화 상담 CTA 구성
   - 모바일에서는 메뉴 링크 일부 숨김

2. `HeroSection`
   - 배경 이미지 + 오버레이
   - 핵심 카피와 2개 CTA 버튼 구성

3. `ServicesSection`
   - Core Services 타이틀
   - 4열 카드(반응형 2열/1열 전환)

4. `PortfolioSection`
   - RSS 카드 그리드
   - 로딩/에러/성공 상태 UI 분기
   - 더보기 버튼 및 표시 건수 안내

5. `ContactSection`
   - 매장 사진 3장, 매장 정보 카드, 내비 버튼 3종, 지도 패널

6. `Footer`
   - 연도 자동 업데이트 저작권 문구

### 2.3 사용자 흐름

1. 신뢰 확인 중심 흐름
   - 랜딩 진입 → 히어로 확인 → 최신 정비 사례 카드 열람 → 블로그 상세 확인

2. 즉시 문의 중심 흐름
   - 랜딩 진입 → 상단/히어로 전화 CTA 클릭 → 통화 연결

3. 방문 유도 흐름
   - 랜딩 진입 → 매장 정보 확인 → T맵/카카오내비/네이버지도 클릭 → 길안내 실행

## 3. 기술 명세 (Technical Specifications)

### 3.1 기술 스택

1. Framework: React 18
2. Build Tool: Vite 6
3. Styling: Tailwind CSS v4 + `@tailwindcss/vite`
4. Language: JavaScript (ES Modules)
5. 배포: GitHub Pages + GitHub Actions
6. 데이터: 네이버 RSS + 정적 JSON 캐시 + 브라우저 로컬 캐시

### 3.2 구현 세부사항

1. 앱 구조
   - `src/App.jsx`는 조립 전용 엔트리
   - `src/sections/*`에 화면 단위 분리
   - `src/components/*`에 재사용 UI 분리
   - `src/utils/navigation.js`에 내비게이션 딥링크 로직 분리

2. RSS 데이터 파이프라인
   - 빌드/스케줄 단계: `scripts/build-rss-cache.mjs`가 `public/data/blog-feed.json` 생성
   - 런타임 단계: `useRssPosts`가 아래 순서로 데이터 확보

3. localStorage 캐시
4. 정적 JSON (`/data/blog-feed.json`)
5. AllOrigins 프록시 RSS 실시간 조회
6. 지도 렌더링
   - `MapPanel`에서 네이버 지도 SDK 동적 로드
   - 실패/미설정 시 임베드 지도로 폴백
7. 운영 상태 표시
   - `useBusinessStatus`에서 KST 기준 현재 영업 상태 계산
   - 1분 간격 갱신

### 3.3 코딩 스타일 가이드

1. 컴포넌트 파일명: PascalCase (`HeroSection.jsx`)
2. 훅 파일명: camelCase + `use` prefix (`useRssPosts.js`)
3. 유틸 파일명: 소문자 명사형 (`navigation.js`)
4. 컴포넌트 책임 분리:
   - 섹션 컴포넌트: 화면 구성
   - 훅: 상태/비동기 로직
   - 유틸: 순수 로직/브라우저 전환 로직

5. CSS 전략:
   - Tailwind 유틸리티 우선
   - 전역 최소 스타일만 `src/styles.css` 유지

### 3.4 권장 폴더 구조

```text
src/
  components/
    blog/
    layout/
    MapPanel.jsx
  hooks/
  sections/
  utils/
  constants.js
  App.jsx
  main.jsx
```

## 4. 디자인 명세 (Design Specifications)

### 4.1 디자인 시스템

브랜드 컬러:

1. Primary Yellow: `#FFC107`
2. Charcoal: `#212529`
3. Panel: `#15181B`

타이포그래피:

1. 기본 폰트: `Noto Sans KR`
2. 강조 텍스트: Bold/ExtraBold/Black 비중 높게 사용

스타일 원칙:

1. 다크 기반 고대비 UI
2. CTA는 Yellow 계열 강한 강조
3. 카드/패널은 라운드 + 얇은 경계 + hover 강조

### 4.2 와이어프레임 개념

1. 상단 고정 네비
2. Hero 풀스크린
3. 서비스 카드 그리드
4. 포트폴리오 카드 그리드 + 더보기
5. 연락처/지도 2컬럼
6. 푸터

## 5. 비기능 명세 (Non-Functional Specifications)

### 5.1 성능 요구사항

1. 첫 콘텐츠 표시 지연 최소화:

- 초기 화면은 정적 자산 우선 렌더링
- 포트폴리오는 캐시 우선 전략 사용

1. 피드 로딩 전략:

- localStorage → 정적 JSON → 실시간 RSS 순차 fallback

1. 운영 자동화:

- GitHub Actions 스케줄(30분)로 캐시 최신화

권장 목표(운영 기준):

1. 모바일 LCP 2.5초 이내
2. 초기 JS 번들 gzip 200KB 이내 유지
3. RSS 실패 시에도 포트폴리오 섹션 graceful degradation 보장

### 5.2 접근성 요구사항

1. 모든 액션 요소에 명확한 텍스트 라벨 제공
2. 버튼/링크 포커스 가능 상태 유지
3. 이미지에 `alt` 텍스트 제공
4. 외부 링크 `rel="noopener noreferrer"` 적용
5. 최소 WCAG 2.1 AA 수준 대비 확보 목표

### 5.3 보안 요구사항

1. 외부 데이터는 신뢰하지 않고 문자열 정규화 후 사용
2. 외부 링크는 새 창 오픈 시 `noopener` 적용
3. 배포는 HTTPS(GitHub Pages) 사용
4. 민감 키는 `.env`로 분리 (`VITE_NAVER_MAP_CLIENT_ID`)
5. 클라이언트 저장소(localStorage)에는 비민감 데이터만 저장

## 6. 테스트 계획 (Testing Plan)

### 6.1 테스트 범위

1. 단위 테스트

- `useBusinessStatus` 시간대 계산
- RSS 정규화 유틸 함수
- `openNavigation` provider 분기

1. 통합 테스트

- `useRssPosts` fallback 순서 동작
- `BlogCards` 로딩/에러/성공 렌더 분기

1. UI/E2E 테스트

- 전화 버튼 클릭 시 `tel:` 링크 확인
- 더보기 버튼 동작 확인
- 지도 fallback 렌더 확인

### 6.2 권장 테스트 도구

1. Unit/Integration: Vitest + React Testing Library
2. E2E: Playwright
3. 정적 검사: ESLint + Prettier (향후 도입 권장)

### 6.3 배포 전 체크리스트

1. `npm run sync:rss` 성공 여부
2. `npm run build` 성공 여부
3. 주요 섹션 모바일 뷰 확인
4. RSS 카드 이미지 깨짐 fallback 확인
5. 지도 키 미설정/설정 상태 모두 점검

## 7. 운영 및 업데이트 정책

1. 기능 변경 시 본 문서 버전 업데이트
2. 배포 파이프라인/환경변수 변경 시 기술 명세 즉시 반영
3. UI 구조 변경 시 화면 설계 섹션 동기화
4. 테스트 범위 확장 시 테스트 계획 섹션 동기화

## 8. 향후 개선 로드맵

1. RSS 파서 인코딩 안정성 강화
2. 카드 필터(차종/작업유형) 및 검색 기능
3. 웹폰트 로딩 최적화 및 이미지 WebP 전환
4. 접근성 자동 점검(axe) CI 도입
5. 예약 문의 폼 또는 카카오 채널 연동 검토
