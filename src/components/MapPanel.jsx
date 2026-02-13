import { useEffect, useRef } from "react";
import { STORE } from "../constants";

const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

function renderFallback(container) {
  if (!container) return;
  container.innerHTML = `
    <iframe
      title="JM MOTORI 위치"
      src="https://www.google.com/maps?q=${STORE.lat},${STORE.lng}&hl=ko&z=16&output=embed"
      width="100%"
      height="100%"
      style="border:0"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  `;
}

function renderNaverMap(container) {
  const location = new window.naver.maps.LatLng(STORE.lat, STORE.lng);
  const map = new window.naver.maps.Map(container, {
    center: location,
    zoom: 17,
  });

  new window.naver.maps.Marker({
    position: location,
    map,
    title: STORE.name,
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

    const handleError = () => renderFallback(container);
    const existingScript = document.getElementById("naver-map-sdk");

    if (existingScript) {
      if (window.naver?.maps) {
        renderNaverMap(container);
      } else {
        existingScript.addEventListener("load", handleLoad, { once: true });
        existingScript.addEventListener("error", handleError, { once: true });
      }
      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = "naver-map-sdk";
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAP_CLIENT_ID}`;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div className="map-panel">
      <div className="map-canvas" ref={mapRef} />
      <p className="map-note">
        `VITE_NAVER_MAP_CLIENT_ID`를 설정하면 네이버 지도가 활성화되고, 미설정 시 임베드 지도로 폴백됩니다.
      </p>
    </div>
  );
}

