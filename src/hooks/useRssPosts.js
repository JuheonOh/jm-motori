import { useCallback, useEffect, useState } from "react";
import { BLOG_URL, RSS_URL } from "../constants";

const fallbackThumb = `${import.meta.env.BASE_URL}assets/images/3.jpg`;
const REQUEST_TIMEOUT_MS = 10000;

const proxyUrls = [
  `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`,
  `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`,
];

function toSafeUrl(url, fallback) {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return fallback;
}

function normalizeText(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlText}</div>`, "text/html");
  const text = doc.body.textContent || "";
  return text.replace(/\s+/g, " ").trim();
}

function extractThumbnail(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlText}</div>`, "text/html");
  const image = doc.querySelector("img");
  if (!image) return fallbackThumb;
  return toSafeUrl(image.getAttribute("src"), fallbackThumb);
}

function toDateLabel(pubDateRaw) {
  if (!pubDateRaw) return "날짜 정보 없음";
  const date = new Date(pubDateRaw);
  if (Number.isNaN(date.getTime())) return "날짜 정보 없음";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/xml,text/xml,application/json;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchXmlWithFallback() {
  const errors = [];

  for (const proxyUrl of proxyUrls) {
    try {
      const response = await fetchWithTimeout(proxyUrl);
      if (!response.ok) {
        errors.push(`${proxyUrl} -> HTTP ${response.status}`);
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json") || proxyUrl.includes("/get?")) {
        const data = await response.json();
        const contents = data?.contents?.trim();
        if (!contents) {
          errors.push(`${proxyUrl} -> empty JSON contents`);
          continue;
        }
        return contents;
      }

      const xmlText = (await response.text())?.trim();
      if (!xmlText) {
        errors.push(`${proxyUrl} -> empty response`);
        continue;
      }
      return xmlText;
    } catch (error) {
      const reason = error?.name === "AbortError" ? "timeout" : error?.message || "unknown";
      errors.push(`${proxyUrl} -> ${reason}`);
    }
  }

  throw new Error(`RSS proxy fetch failed: ${errors.join(" | ")}`);
}

export function useRssPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        const xmlText = await fetchXmlWithFallback();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        const items = Array.from(xml.querySelectorAll("item")).slice(0, 6);

        if (!items.length) {
          throw new Error("No RSS items");
        }

        const parsed = items.map((item, index) => {
          const title = (item.querySelector("title")?.textContent || "제목 없음").trim();
          const link = toSafeUrl(item.querySelector("link")?.textContent?.trim(), BLOG_URL);
          const descriptionHtml = item.querySelector("description")?.textContent || "";
          const summaryRaw = normalizeText(descriptionHtml);
          const dateLabel = toDateLabel(item.querySelector("pubDate")?.textContent || "");

          return {
            id: `${link}-${index}`,
            title,
            link,
            summary:
              summaryRaw.length > 92
                ? `${summaryRaw.slice(0, 92)}...`
                : summaryRaw || "포스팅 미리보기가 준비되지 않았습니다.",
            thumbnail: extractThumbnail(descriptionHtml),
            dateLabel,
          };
        });

        if (!isMounted) return;
        setPosts(parsed);
      } catch (fetchError) {
        if (!isMounted) return;
        setError(fetchError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [reloadToken]);

  return { posts, loading, error, refetch };
}
