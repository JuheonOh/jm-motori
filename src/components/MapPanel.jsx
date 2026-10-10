import { useEffect, useRef } from "react";
import { NAVER_MAP_SEARCH_URL, STORE } from "../constants";

const NAVER_MAP_CLIENT_ID = (import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "").trim();
const NAVER_MAP_SCRIPT_ID = "naver-map-sdk";
const NAVER_MAP_SCRIPT_SRC = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}&submodules=geocoder`;

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

function renderNaverMap(container) {
  const storeLocation = new window.naver.maps.LatLng(STORE.lat, STORE.lng);
  const map = new window.naver.maps.Map(container, {
    center: storeLocation,
    zoom: 19,
  });

  new window.naver.maps.Marker({
    position: storeLocation,
    map,
    title: STORE.name,
    icon: {
      url: "https://ssl.pstatic.net/static/maps/mantle/1x/marker-default.png",
      size: new window.naver.maps.Size(22, 33),
      anchor: new window.naver.maps.Point(11, 45),
    },
  });
}

export default function MapPanel() {
  const mapRef = useRef(null);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return undefined;

    if (!NAVER_MAP_CLIENT_ID) {
      renderFallback(container);
      return undefined;
    }

    const handleLoad = () => {
      if (window.naver?.maps) {
        renderNaverMap(container);
      } else {
        renderFallback(container);
      }
    };

    const handleError = (targetScript) => {
      if (targetScript) {
        targetScript.dataset.loadState = "error";
      }
      renderFallback(container);
    };

    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID);
    if (existingScript && existingScript.src !== NAVER_MAP_SCRIPT_SRC) {
      existingScript.remove();
    }

    const reusableScript = document.getElementById(NAVER_MAP_SCRIPT_ID);
    if (reusableScript) {
      if (window.naver?.maps) {
        renderNaverMap(container);
      } else if (reusableScript.dataset.loadState === "loaded" || reusableScript.dataset.loadState === "error") {
        renderFallback(container);
      } else {
        const handleReusableError = () => {
          handleError(reusableScript);
        };
        reusableScript.addEventListener("load", handleLoad, { once: true });
        reusableScript.addEventListener("error", handleReusableError, { once: true });

        return () => {
          reusableScript.removeEventListener("load", handleLoad);
          reusableScript.removeEventListener("error", handleReusableError);
        };
      }
      return undefined;
    }

    const script = document.createElement("script");
    script.id = NAVER_MAP_SCRIPT_ID;
    script.async = true;
    script.src = NAVER_MAP_SCRIPT_SRC;
    const onScriptLoad = () => {
      script.dataset.loadState = "loaded";
      handleLoad();
    };
    const onScriptError = () => {
      handleError(script);
    };
    script.addEventListener("load", onScriptLoad, { once: true });
    script.addEventListener("error", onScriptError, { once: true });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", onScriptLoad);
      script.removeEventListener("error", onScriptError);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#171a1f_0%,#111317_100%)] shadow-[0_22px_52px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#ffc107]">위치 안내</p>
          <p className="mt-1 text-sm font-extrabold text-white">JM MOTORI 위치</p>
        </div>
      </div>

      <div className="relative">
        <div className="h-90 w-full bg-slate-800" ref={mapRef} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.75)_100%)] p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#ffc107]">주소</p>
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
