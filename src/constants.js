export const STORE = {
  name: "JM MOTORI",
  phone: "010-4195-7485",
  roadAddress: "광주 광산구 사암로106번길 68",
  jibunAddress: "광주 광산구 우산동 1073-1",
  address: "광주 광산구 사암로106번길 68 1층 (우산동 1073-1)",
  openHours: "월~금 09:00~19:00 / 토요일 예약제 운영 / 일요일 휴무",
  lat: 35.1535420063436,
  lng: 126.81100486782,
};

export const NAV_LINKS = [
  { href: "#services", label: "정비 서비스" },
  { href: "#portfolio", label: "정비 사례" },
  { href: "#contact", label: "오시는 길" },
];

export const SERVICES = [
  {
    title: "경정비·소모품",
    description: "엔진오일, 브레이크 오일, 냉각수, 점화계통 등 주기 관리 중심 정비",
  },
  {
    title: "미션·엔진 진단",
    description: "전용 진단 장비 기반의 오류 코드 분석과 정밀 점검 리포트 제공",
  },
  {
    title: "하체·브레이크",
    description: "하체 소음, 제동 성능 저하, 얼라인먼트 이슈를 차량 상태에 맞춰 정비",
  },
  {
    title: "전기·전자 수리",
    description: "센서, 배터리, 경고등 점등 원인 추적 및 부품 교체/세팅 대응",
  },
];

export const RSS_URL = "https://rss.blog.naver.com/ablymotors.xml";
export const BLOG_URL = "https://blog.naver.com/ablymotors";
export const NAVER_MAP_SEARCH_URL = `https://map.naver.com/v5/search/${encodeURIComponent(STORE.jibunAddress)}`;
