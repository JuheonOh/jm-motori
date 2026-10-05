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
    title: "오일·소모품 교환",
    description: "엔진오일 · 미션오일 · 냉각수 · 점화플러그",
  },
  {
    title: "경고등·엔진 점검",
    description: "엔진 경고등 · 누유 · 냉각계통 · 디젤 흡기·배기",
  },
  {
    title: "진동·하체 정비",
    description: "엔진·미션 마운트 · 하체 소음 · 서스펜션",
  },
  {
    title: "브레이크·타이어",
    description: "브레이크 패드·디스크 · 브레이크 오일 · 타이어",
  },
];

export const RSS_URL = "https://rss.blog.naver.com/ablymotors.xml";
export const BLOG_URL = "https://blog.naver.com/ablymotors";
export const NAVER_MAP_SEARCH_URL = `https://map.naver.com/v5/search/${encodeURIComponent(STORE.jibunAddress)}`;
