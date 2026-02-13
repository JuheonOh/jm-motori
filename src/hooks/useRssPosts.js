import { useCallback, useEffect, useState } from "react";
import { BLOG_URL, RSS_URL } from "../constants";

const baseUrl = import.meta.env.BASE_URL;
const FEED_JSON_URL = `${baseUrl}data/blog-feed.json`;
const fallbackThumb = `${baseUrl}assets/images/3.jpg`;
const REQUEST_TIMEOUT_MS = 8000;
const STORAGE_KEY = "jm_blog_feed_cache_v1";
const THUMB_PROXY_BASE = "https://wsrv.nl/?url=";
const THUMB_PROXY_PARAMS = "&w=960&h=600&fit=cover&output=webp&q=80";

const proxyUrls = [
  `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`,
  `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`,
];

function toSafeUrl(url, fallback) {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return url;
  return fallback;
}

function toThumbnailProxyUrl(url, fallback = fallbackThumb) {
  const safeUrl = toSafeUrl(url, fallback);
  if (!safeUrl || safeUrl === fallback) return fallback;
  if (safeUrl.startsWith("/")) return safeUrl;
  if (safeUrl.includes("wsrv.nl/?url=")) return safeUrl;

  const protocolLessUrl = safeUrl.replace(/^https?:\/\//i, "");
  return `${THUMB_PROXY_BASE}${encodeURIComponent(protocolLessUrl)}${THUMB_PROXY_PARAMS}`;
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
  return toThumbnailProxyUrl(image.getAttribute("src"), fallbackThumb);
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

function normalizePost(post, index = 0) {
  const title = (post?.title || "제목 없음").trim();
  const link = toSafeUrl(post?.link?.trim(), BLOG_URL);
  const summaryRaw = (post?.summary || "").trim();
  const pubDate = post?.pubDate || "";

  return {
    id: post?.id || `${link}-${index}`,
    title,
    link,
    summary:
      summaryRaw.length > 92
        ? `${summaryRaw.slice(0, 92)}...`
        : summaryRaw || "포스팅 미리보기가 준비되지 않았습니다.",
    thumbnail: toThumbnailProxyUrl(post?.thumbnail, fallbackThumb),
    dateLabel: post?.dateLabel || toDateLabel(pubDate),
  };
}

function readLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.items || !Array.isArray(parsed.items)) return null;
    return parsed.items.map((item, index) => normalizePost(item, index));
  } catch {
    return null;
  }
}

function writeLocalCache(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cachedAt: Date.now(), items }));
  } catch {
    // Ignore quota/privacy mode errors.
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json,application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchFromStaticJson() {
  const response = await fetchWithTimeout(FEED_JSON_URL);
  if (!response.ok) {
    throw new Error(`Static feed HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("Static feed has no items");
  }

  return payload.items.map((item, index) => normalizePost(item, index));
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

async function fetchFromRssProxy() {
  const xmlText = await fetchXmlWithFallback();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const items = Array.from(xml.querySelectorAll("item")).slice(0, 6);

  if (!items.length) {
    throw new Error("No RSS items");
  }

  return items.map((item, index) => {
    const title = (item.querySelector("title")?.textContent || "제목 없음").trim();
    const link = toSafeUrl(item.querySelector("link")?.textContent?.trim(), BLOG_URL);
    const descriptionHtml = item.querySelector("description")?.textContent || "";
    const summaryRaw = normalizeText(descriptionHtml);
    const pubDate = item.querySelector("pubDate")?.textContent || "";

    return {
      id: `${link}-${index}`,
      title,
      link,
      summary:
        summaryRaw.length > 92
          ? `${summaryRaw.slice(0, 92)}...`
          : summaryRaw || "포스팅 미리보기가 준비되지 않았습니다.",
      thumbnail: extractThumbnail(descriptionHtml),
      dateLabel: toDateLabel(pubDate),
    };
  });
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
      setError(null);

      const cached = readLocalCache();
      if (cached?.length && isMounted) {
        setPosts(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const staticItems = await fetchFromStaticJson();
        if (!isMounted) return;
        setPosts(staticItems);
        writeLocalCache(staticItems);
        setLoading(false);
        return;
      } catch {
        // Fallback to live RSS proxy if static cache load fails.
      }

      try {
        const liveItems = await fetchFromRssProxy();
        if (!isMounted) return;
        setPosts(liveItems);
        writeLocalCache(liveItems);
      } catch (fetchError) {
        if (!isMounted) return;
        if (!cached?.length) {
          setError(fetchError);
        }
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
