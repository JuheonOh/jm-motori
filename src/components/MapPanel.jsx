import { useEffect, useRef } from "react";
import { STORE } from "../constants";

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
    <div
      ref={mapRef}
      role="region"
      aria-label="JM모토리 위치 지도"
      className="map-panel"
    />
  );
}
