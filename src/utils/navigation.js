import { NAVER_MAP_SEARCH_URL, STORE } from "../constants";

const GEOCODE_QUERIES = [STORE.jibunAddress, STORE.roadAddress, STORE.address];

function geocodeQuery(service, query) {
  return new Promise((resolve) => {
    service.geocode({ query }, (status, response) => {
      const okStatus = service.Status?.OK || "OK";
      if (status !== okStatus) {
        resolve(null);
        return;
      }

      const first = response?.v2?.addresses?.[0];
      const lat = Number(first?.y);
      const lng = Number(first?.x);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        resolve(null);
        return;
      }

      resolve({ lat, lng });
    });
  });
}

async function resolveStoreLatLng() {
  const service = window.naver?.maps?.Service;
  if (!service?.geocode) return null;

  for (const query of GEOCODE_QUERIES) {
    if (!query) continue;
    const resolved = await geocodeQuery(service, query);
    if (resolved) return resolved;
  }

  return null;
}

export async function openNavigation(provider) {
  const resolved = await resolveStoreLatLng();
  const lat = resolved?.lat ?? STORE.lat;
  const lng = resolved?.lng ?? STORE.lng;

  const appLinks = {
    tmap: `tmap://route?goalname=${encodeURIComponent(STORE.name)}&goalx=${lng}&goaly=${lat}`,
    kakao: `kakaonavi://navigate?name=${encodeURIComponent(STORE.name)}&x=${lng}&y=${lat}`,
  };

  const webFallbackByProvider = {
    tmap: NAVER_MAP_SEARCH_URL,
    kakao: `https://map.kakao.com/link/to/${encodeURIComponent(STORE.name)},${lat},${lng}`,
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
