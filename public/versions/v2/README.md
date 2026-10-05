# JM MOTORI — MINI 전문 정비 랜딩 페이지 v2

2026.10.01 디자인 수정본. 기존의 매거진 중심 시안을 정비 상담과 방문 안내 중심으로 재구성했습니다.
**독립 HTML 시안이며, 운영 홈페이지나 GitHub 저장소에 배포하지 않았습니다.**

## 바로 확인

`index.html`을 Chrome, Whale 또는 Edge로 열면 됩니다. 별도 설치나 서버 없이 동작합니다.

- 첫 화면: 광주 MINI 전문 정비 / 한국어 메인 카피 / 전화 상담 / 전화번호 / 주소
- 주요 정비 분야 6개: 누르면 관련 MINI 정비 기록을 검색합니다.
- 대표 MINI 사례 3개: 경고등, 진동, 냉각계통. 최신순 목록이 아니라 주제별로 선택한 사례입니다.
- 전체 기록은 접힌 영역에 보관합니다. 열면 MINI가 기본 선택됩니다. BMW와 다른 차종의 원본 사례도 유지했습니다.
- 카드와 목록 전환, 차종·증상·검색어 조합, 더 보기, 결과 없음, 원문 미리보기, 원문 링크를 지원합니다.
- 방문 안내와 모바일 하단 전화·위치 버튼을 제공합니다. 전화 버튼은 `tel:` 링크이며 온라인 예약을 접수하지 않습니다.

## 사진 상태 — 배포 전 확인 필요

**전달된 HTML에는 사진 파일이 내장되어 있지 않습니다.** 기존 홈페이지 2장의 사진과 RSS 대표 사진 URL을 연결했습니다. 제작 환경에서 해당 원본 이미지를 내려받거나 실제 크롭을 확인하지 못했습니다.

`preview/` 캡처는 외부 네트워크를 차단한 대체 화면입니다. 사진이 로드된 최종 모습으로 해석하면 안 됩니다. 대체 화면에는 이미지 실패 안내가 표시됩니다. 가상의 정비 사진이나 다른 업체의 사진은 사용하지 않았습니다.

연결한 사진:
- 작업장: 기존 홈페이지 `assets/images/2.jpg`
- 매장 외관: 기존 홈페이지 `assets/images/1.jpg`
- 사례 이미지: 각 원본 RSS 글의 `image` 값

실제 사진을 포함하려면 네트워크가 되는 환경에서 다음을 실행하세요. 원본 서버의 응답·허용 여부에 따라 실패할 수 있으며, 실패 시 기존 파일을 보존합니다.

```sh
python scripts/cache_assets.py
python scripts/build.py
```

전체 RSS 사진까지 함께 저장하려면 `python scripts/cache_assets.py --all`을 사용합니다. 기본 명령은 홈페이지 2장과 선정 사례 3장만 저장합니다. 이미지 크기가 그대로 포함되므로 배포 전 웹용 크기로 최적화하는 것이 좋습니다.

직접 받은 실제 사진도 사용할 수 있습니다. `assets/`에 JPG/PNG/WebP를 넣고 `assets/manifest.json`을 아래 형식으로 작성한 뒤 다시 빌드하세요.

```json
{
  "workshop": "workshop.jpg",
  "exterior": "exterior.jpg",
  "post:224418635792": "countryman-dpf.jpg",
  "post:224412185380": "countryman-mount.jpg",
  "post:224391965370": "f56-cooling.jpg"
}
```

등록한 사진은 빌드 시 HTML 내부에 들어갑니다. 각 사례와 실제로 일치하는 사진을 사용하고, 개인정보·차량번호 공개 여부와 사용 권한을 확인하세요. 파일 이름만 바꾸어 다른 작업의 사진처럼 표시하지 마세요.

## 파일 구조

```text
index.html                     바로 실행하는 독립 HTML
src/page.html                  화면 구조와 방문 안내
src/styles.css                 반응형 스타일
src/app.js                     검색, 카드, 모달, 메뉴, 사진 상태 처리
data/feed.json                 원문 정보를 보존한 RSS 스냅샷
data/source-snapshot.xml       원본 RSS 수집본
data/editorial-overrides.json  기존 화면용 제목 편집값
data/landing-config.json       대표 MINI 사례 선택과 짧은 표시 문구
scripts/build.py               독립 HTML 빌드
scripts/sync_rss.py            RSS 정제·갱신
scripts/cache_assets.py        허용된 원본 사진 다운로드
scripts/test_browser.py        반응형·UI 테스트
scripts/render_preview.py      독립된 초기 상태의 오프라인 캡처
preview/test-results.json      이번 검사 결과
assets/                       선택적으로 직접 보관하는 실제 사진
```

## 수정과 빌드

Python 3.10 이상을 사용합니다. 빌드·RSS·사진 저장 스크립트는 표준 라이브러리만 사용합니다.

```sh
python scripts/build.py
```

브랜드 표기는 **MINI 전문 정비**로 통일했습니다. 원본 블로그 제목·RSS 미리보기에서 과거 BMW 전문 표현이 등장할 수 있습니다. 원문 인용을 변조하지 않고 출처와 현재 전문 분야를 미리보기 안에 구분해 안내합니다.

주소·전화번호·영업시간은 이전 사이트 소스의 값을 유지했습니다. 실제 운영 시간과 상담 절차는 배포 전에 매장과 확인해야 합니다. 임의의 경력·누적 작업 수·만족도·공식 인증·지역 독점성은 추가하지 않았습니다.

일반 본문과 섹션 제목은 한국어 중심이며 Google Fonts CSS와 시스템 글꼴을 사용합니다. **글꼴 파일은 포함하지 않았습니다.** 외부 글꼴을 못 받으면 설치된 글꼴로 표시되어 글자 폭과 줄바꿈이 조금 달라질 수 있습니다.

## RSS 갱신

```sh
# 보관한 XML을 다시 정제
python scripts/sync_rss.py

# 실제 Naver RSS를 가져와 갱신
python scripts/sync_rss.py --fetch

# HTML에 새 수집본 반영
python scripts/build.py
```

현재 HTML은 **2026.10.01 RSS 스냅샷**으로 동작합니다. 실시간 연동·주기 작업은 설정하지 않았습니다. 기존 배포 파이프라인에 갱신과 빌드를 통합할 수 있습니다.

대표 사례는 `data/landing-config.json`에서 고릅니다. 지정 글이 새 RSS 범위에서 빠지면 남아 있는 MINI 글로 채웁니다. 새 수집본에 MINI 글이 3개보다 적으면 있는 글만 노출합니다. RSS는 전체 블로그 보관함이 아니므로 과거 글 영구 보존이 필요하면 별도의 누적 저장 정책이 필요합니다.

서비스·증상 분류는 탐색용 키워드 분류입니다. 부품 교체의 필요성, 정비 결과나 고장 원인을 자동 진단하지 않습니다. 정비 기록 미리보기는 RSS의 일부 본문이며 전체 내용은 원본 블로그로 연결합니다.

## 검증 범위

이번 제작 환경의 Chromium에서 320, 360, 390, 430, 680, 768, 1024, 1280, 1440, 1920px 총 10개 너비를 확인했습니다. 페이지 가로 넘침, 대표 사례 수와 MINI 제한, 기본 아카이브 접힘, 검색/필터/더 보기, 빈 결과/초기화, 모달 열기·Escape 닫기·포커스 복원, 모바일 메뉴, 전화 링크, 주소 복사 피드백을 검사했습니다. 결과는 `preview/test-results.json`에 있습니다.

이 검사는 **외부 네트워크가 차단된 상태의 UI 검사**입니다. 네이버 원문/지도 연결 후 동작, 휴대전화에서 실제 전화 앱 호출, 원본 이미지 화질과 크롭, 전체 브라우저별 호환성을 검증했다는 뜻은 아닙니다.

검사 스크립트는 Playwright와 Chromium이 별도로 필요합니다. 현재 검사 환경의 브라우저 경로는 `/usr/bin/chromium`입니다. 다른 환경에서는 `executable_path`를 설치한 Chromium 경로로 변경하거나 해당 옵션을 제거하고 Playwright의 Chromium을 설치하세요.

```sh
python -m pip install playwright
python -m playwright install chromium
python scripts/test_browser.py
python scripts/render_preview.py
```

## 배포 전 체크

실제 작업장과 사례 사진을 확인하고 넣은 뒤 크롭/모바일 화면을 검토하세요. 매장 연락처·주소·운영 시간을 확인하고, 전화/네이버 원문/지도 연결을 실제 기기에서 눌러 확인하세요. 실제 사이트로 전환할 때는 하단 `DESIGN v2` 시안 문구와 출처 안내의 배포 상태 문구도 함께 정리하세요. 현재 사이트의 지도 SDK, SEO 태그, 운영 데이터 수집 주기를 그대로 바꿔 놓은 패치 파일은 아닙니다.
