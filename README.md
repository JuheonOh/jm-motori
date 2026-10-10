# JM MOTORI SPA (요약본)

자동차 정비소 JM MOTORI의 공식 랜딩 SPA 프로젝트입니다.
실제 매장 정보와 네이버 블로그 정비 사례를 연결해 신뢰도와 방문 전환을 높이는 것이 목표입니다.

상세 명세서는 `docs/JM_MOTORI_SPA_SPEC_v1.10.md`를 참고하세요.

## 1. 프로젝트 핵심

1. 실제 작업 사진과 정비 사례로 매장 소개
2. 모바일 기준 전화/길안내 즉시 연결
3. 블로그 포트폴리오 자동 최신화

## 2. 주요 기능

1. 고정 네비게이션 + 전화 CTA
2. 히어로 섹션(핵심 메시지/CTA)
3. 정비 서비스 카드 섹션
4. 최신 정비 사례 카드(RSS 기반, 더보기/재시도)
5. 매장 정보 + 지도 + 카카오내비/네이버지도 연결

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

### Docker로 실행 및 관리

Docker Engine 또는 Docker Desktop과 Docker Compose v2가 필요합니다.
아래 명령은 `compose.yaml`이 있는 프로젝트 디렉터리에서 실행합니다.

```bash
# 선택 사항: 네이버 지도 ID를 사용할 경우 .env를 복사하고 값을 설정
cp .env.example .env

# 운영용: Node에서 빌드한 정적 파일을 Nginx로 제공
docker compose up -d --build
# 접속: http://localhost:8080

# 상태 / 로그 / 중지 및 컨테이너 제거
docker compose ps
docker compose logs -f web
docker compose down
```

운영 포트 변경: `PORT=8081 docker compose up -d --build`.
소스 또는 `VITE_NAVER_MAP_CLIENT_ID` 변경 후에는 같은 명령으로 다시 빌드합니다.
Vite 환경 변수는 [빌드 시 정적 파일에 포함](https://vite.dev/guide/env-and-mode)되므로 공개 가능한 값만 사용합니다.
`.env` 파일과 로컬 `node_modules`, 기존 `dist`는 이미지 빌드에서 제외합니다.

```bash
# 개발용: 소스 변경 즉시 반영, 시작할 때 잠금 파일 기준으로 의존성 설치
docker compose up --build dev
# 접속: http://localhost:5173 (종료: Ctrl+C)

# 개발용 컨테이너까지 제거
docker compose --profile dev down

# RSS 캐시를 갱신하고 운영 이미지에 반영
docker compose run --rm dev npm run sync:rss
docker compose up -d --build web
```

개발용은 소스를 바인드 마운트하고 컨테이너 전용 `node_modules` 볼륨을 사용합니다.
운영 이미지는 저장된 RSS 캐시를 사용하며, Docker에서 자동 RSS 갱신은 수행하지 않습니다.
GitHub Pages의 기존 스케줄 배포는 그대로 동작합니다.

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
2. 15분 주기 스케줄로 RSS 변경 감지
3. RSS 변경이 있을 때만 Pages 재배포

## 9. 다음 개선 후보

1. RSS 파서 인코딩 안정성 강화
2. 카드 필터/검색 기능
3. 접근성 자동 점검(axe) CI 도입

## 디자인 개선 및 검증

현재 디자인 기준은 `DESIGN.md`, 실제 블로그 확인 및 사진 출처는
`docs/CONTENT-SOURCES.md`에 기록합니다. 정비 사례는 RSS JSON의 썸네일·원문 제목·게시일로 자동 구성합니다.
데스크톱은 최초 6개, 모바일은 3개를 표시하고 더보기마다 같은 수만큼 추가합니다.
제목은 화면에서만 최대 2줄로 제한하며 썸네일은 원본 비율에 따라 자동 높이로 표시합니다.
수동 대표 사례나 글 ID별 제목 덮어쓰기를 사용하지 않습니다.
최신화에 실패하면 이전에 불러온 사례를 유지하고 실패 안내와 재시도를 제공합니다.

```bash
npm run build
node scripts/check-rss.mjs
npm run preview
```

RSS 검사는 원문 문자 보존과 유효한 캐시 보존, 손상된 캐시 및 저장 실패 처리를 확인합니다.
현재 화면은 미리보기에서 전화·더보기·메뉴·반응형·데이터 오류·사진 fallback·썸네일 원본 비율을 확인합니다.

## 버전별 비교

개발 서버에서 `/versions/index.html`을 열면 버전별로 확인할 수 있습니다.

- `/versions/v1/index.html`: 최초 클론한 HEAD의 기존 페이지 빌드.
- `/versions/v2/index.html`: 전달받은 `JM-MOTORI-Service-Landing-v2-Source.zip` 원본 시안.
- `/versions/v3/index.html`: 이전 개선 소스의 보존용 빌드. 문구·지도·모바일 사례 수·썸네일 비율 개선을 포함합니다.

`public/versions`는 비교용 보존 스냅샷이며 현재 소스를 수정하거나 RSS를 갱신해도
빌드 파일은 자동 변경되지 않습니다. 원본 커밋/ZIP 해시와 파일별 해시는
`public/versions/manifest.json`에 기록했습니다. 기존 RSS 캐시/외부 이미지 동작은
각 원본 구현 그대로입니다. 루트 `/`는 계속 현재 작업 중인 최신 페이지입니다.

## v4 리뉴얼 (2026-10-02)

`/versions/v4/index.html`에서 과거 리뉴얼 화면을 확인합니다. 아이보리/옐로 분할 히어로, 실제 매장 사진, 정비 서비스 목록, RSS 정비 기록과 방문 안내로 전체 디자인을 새로 구성했습니다. v1~v3는 유지합니다. 기존 RSS·메뉴·전화·지도 기능과 반응형 검사를 재사용하며 추가 의존성은 없습니다.


## 리뉴얼 전 디자인 복원 (2026-10-10)

루트 `/`의 디자인 소스를 `d3666b1` 직전 커밋 `a697231` 기준으로 복원했습니다. 어두운 배경과 전체 화면 매장 사진 히어로를 사용합니다. RSS 수집·오류 처리와 `/versions/`의 비교 화면은 유지합니다. 저장소의 `scripts/check-browser.cjs`는 과거 리뉴얼 레이아웃 전용 검사이므로 복원 화면에는 적용하지 않습니다.

정리 범위와 검증 결과는 `docs/AI-SLOP-CLEANUP.md`에 기록합니다.
