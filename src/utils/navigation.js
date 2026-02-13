import { NAVER_MAP_SEARCH_URL, STORE } from "../constants";

export function openNavigation(provider) {
  const appLinks = {
    tmap: `tmap://route?goalname=${encodeURIComponent(STORE.name)}&goalx=${STORE.lng}&goaly=${STORE.lat}`,
    kakao: `kakaonavi://navigate?name=${encodeURIComponent(STORE.name)}&x=${STORE.lng}&y=${STORE.lat}`,
  };

  const webFallbackByProvider = {
    tmap: NAVER_MAP_SEARCH_URL,
    kakao: `https://map.kakao.com/link/to/${encodeURIComponent(STORE.name)},${STORE.lat},${STORE.lng}`,
  };

  const appLink = appLinks[provider];
  if (!appLink) {
    window.open(NAVER_MAP_SEARCH_URL, "_blank", "noopener,noreferrer");
    return;
  }

  const fallbackUrl = webFallbackByProvider[provider] || NAVER_MAP_SEARCH_URL;
  const startedAt = Date.now();

  window.location.href = appLink;
  window.setTimeout(() => {
    if (Date.now() - startedAt < 1600) {
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }, 1200);
}
