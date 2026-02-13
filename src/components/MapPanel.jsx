import { useEffect, useRef, useState } from "react";
import { NAVER_MAP_SEARCH_URL, STORE } from "../constants";

const NAVER_MAP_CLIENT_ID = (import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "").trim();
const NAVER_MAP_SCRIPT_ID = "naver-map-sdk";
const NAVER_MAP_SCRIPT_SRC = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
const GEOCODE_QUERIES = [STORE.jibunAddress, STORE.roadAddress, STORE.address];

function renderFallback(container) {
  if (!container) return;
  container.innerHTML = `
    <iframe
      title="JM MOTORI 위치"
      src="https://www.google.com/maps?q=${encodeURIComponent(STORE.jibunAddress)}&hl=ko&z=16&output=embed"
      width="100%"
      height="100%"
      style="border:0"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  `;
}

function extractLatLngFromGeocode(response) {
  const first = response?.v2?.addresses?.[0];
  const lat = Number(first?.y);
  const lng = Number(first?.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function geocodeQuery(service, query) {
  return new Promise((resolve) => {
    service.geocode({ query }, (status, response) => {
      const okStatus = service.Status?.OK || "OK";
      if (status !== okStatus) {
        resolve(null);
        return;
      }
      resolve(extractLatLngFromGeocode(response));
    });
  });
}

async function resolveStoreLatLng(service) {
  for (const query of GEOCODE_QUERIES) {
    if (!query) continue;
    const resolved = await geocodeQuery(service, query);
    if (resolved) return resolved;
  }
  return null;
}

function renderNaverMap(container) {
  const fallbackLocation = new window.naver.maps.LatLng(STORE.lat, STORE.lng);
  const map = new window.naver.maps.Map(container, {
    center: fallbackLocation,
    zoom: 17,
  });

  const marker = new window.naver.maps.Marker({
    position: fallbackLocation,
    map,
    title: STORE.name,
  });

  const service = window.naver.maps.Service;
  if (!service?.geocode) return;

  resolveStoreLatLng(service).then((resolved) => {
    if (!resolved) return;
    const exactLocation = new window.naver.maps.LatLng(resolved.lat, resolved.lng);
    map.setCenter(exactLocation);
    marker.setPosition(exactLocation);
  });
}

export default function MapPanel() {
  const mapRef = useRef(null);
  const [mapMode, setMapMode] = useState("loading");

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return undefined;

    if (!NAVER_MAP_CLIENT_ID) {
      setMapMode("fallback");
      renderFallback(container);
      return undefined;
    }

    const handleLoad = () => {
      if (window.naver?.maps) {
        setMapMode("naver");
        renderNaverMap(container);
      } else {
        setMapMode("fallback");
        renderFallback(container);
      }
    };

    const handleError = (targetScript) => {
      if (targetScript) {
        targetScript.dataset.loadState = "error";
      }
      setMapMode("fallback");
      renderFallback(container);
    };

    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID);
    if (existingScript && existingScript.src !== NAVER_MAP_SCRIPT_SRC) {
      existingScript.remove();
    }

    const reusableScript = document.getElementById(NAVER_MAP_SCRIPT_ID);
    if (reusableScript) {
      if (window.naver?.maps) {
        setMapMode("naver");
        renderNaverMap(container);
      } else if (reusableScript.dataset.loadState === "loaded" || reusableScript.dataset.loadState === "error") {
        setMapMode("fallback");
        renderFallback(container);
      } else {
        setMapMode("loading");
        reusableScript.addEventListener("load", handleLoad, { once: true });
        reusableScript.addEventListener(
          "error",
          () => {
            handleError(reusableScript);
          },
          { once: true },
        );
      }

      return () => {
        reusableScript.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.id = NAVER_MAP_SCRIPT_ID;
    script.async = true;
    script.src = NAVER_MAP_SCRIPT_SRC;
    setMapMode("loading");
    script.addEventListener(
      "load",
      () => {
        script.dataset.loadState = "loaded";
        handleLoad();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        handleError(script);
      },
      { once: true },
    );
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
    };
  }, []);

  const modeBadgeClass =
    mapMode === "naver"
      ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-300"
      : mapMode === "loading"
        ? "border-amber-300/40 bg-amber-500/15 text-amber-200"
        : "border-slate-300/30 bg-slate-500/15 text-slate-200";
  const modeDotClass = mapMode === "naver" ? "bg-emerald-300" : mapMode === "loading" ? "bg-amber-200" : "bg-slate-200";
  const modeLabel = mapMode === "naver" ? "Naver API 연결" : mapMode === "loading" ? "지도 로딩 중" : "임베드 지도";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#171a1f_0%,#111317_100%)] shadow-[0_22px_52px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#ffc107]">Map Preview</p>
          <p className="mt-1 text-sm font-extrabold text-white">JM MOTORI 위치</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-bold ${modeBadgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${modeDotClass}`} />
          {modeLabel}
        </span>
      </div>

      <div className="relative">
        <div className="h-[360px] w-full bg-slate-800" ref={mapRef} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.75)_100%)] p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#ffc107]">Address</p>
          <p className="mt-1 text-sm font-bold text-white">{STORE.roadAddress}</p>
          <p className="mt-0.5 text-xs text-slate-300">{STORE.jibunAddress}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3 max-[760px]:grid-cols-1">
        <a
          href={NAVER_MAP_SEARCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-[10px] border border-[#03c75a]/45 bg-[#03c75a]/12 px-3 py-2.5 text-xs font-extrabold text-[#68e89d] transition hover:bg-[#03c75a]/20"
        >
          네이버에서 크게 보기
        </a>
        <a
          href={`tel:${STORE.phone}`}
          className="inline-flex items-center justify-center rounded-[10px] border border-[#ffc107]/45 bg-[#ffc107]/12 px-3 py-2.5 text-xs font-extrabold text-[#ffd34d] transition hover:bg-[#ffc107]/20"
        >
          전화 상담 연결
        </a>
      </div>
    </div>
  );
}
