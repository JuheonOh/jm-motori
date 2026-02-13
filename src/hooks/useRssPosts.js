import { useEffect, useState } from "react";
import { BLOG_URL, RSS_URL } from "../constants";
import fallbackThumb from "../../3.jpg";

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

export function useRssPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPosts() {
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`;
      try {
        const response = await fetch(proxy);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        const items = Array.from(xml.querySelectorAll("item")).slice(0, 6);

        if (!items.length) {
          throw new Error("No RSS items");
        }

        const parsed = items.map((item) => {
          const title = (item.querySelector("title")?.textContent || "제목 없음").trim();
          const link = toSafeUrl(item.querySelector("link")?.textContent?.trim(), BLOG_URL);
          const descriptionHtml = item.querySelector("description")?.textContent || "";
          const summaryRaw = normalizeText(descriptionHtml);

          return {
            id: `${link}-${title}`,
            title,
            link,
            summary:
              summaryRaw.length > 92
                ? `${summaryRaw.slice(0, 92)}...`
                : summaryRaw || "포스팅 미리보기가 준비되지 않았습니다.",
            thumbnail: extractThumbnail(descriptionHtml),
            dateLabel: toDateLabel(item.querySelector("pubDate")?.textContent || ""),
          };
        });

        if (!isMounted) return;
        setPosts(parsed);
        setLoading(false);
      } catch (fetchError) {
        if (!isMounted) return;
        setError(fetchError);
        setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  return { posts, loading, error };
}
