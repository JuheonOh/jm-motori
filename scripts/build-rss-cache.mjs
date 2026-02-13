import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RSS_URL = "https://rss.blog.naver.com/ablymotors.xml";
const REQUEST_TIMEOUT_MS = 12000;
const OUTPUT_RELATIVE_PATH = path.join("public", "data", "blog-feed.json");
const MAX_ITEMS = 12;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT_DIR, OUTPUT_RELATIVE_PATH);

const proxyUrls = [
  RSS_URL,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`,
  `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`,
];

function decodeHtmlEntities(input) {
  return input
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function cleanCdata(input) {
  if (!input) return "";
  const trimmed = input.trim();
  const cdataMatch = trimmed.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/i);
  return cdataMatch ? cdataMatch[1] : trimmed;
}

function extractTag(block, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = block.match(regex);
  if (!match) return "";
  return decodeHtmlEntities(cleanCdata(match[1]));
}

function normalizeText(htmlText) {
  return htmlText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

function toSafeUrl(url, fallback = "") {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return fallback;
}

function extractThumbnail(descriptionHtml, fallbackThumb) {
  const match = descriptionHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return fallbackThumb;
  return toSafeUrl(match[1], fallbackThumb);
}

function parsePosts(xmlText, fallbackThumb) {
  const items = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  let index = 0;

  while ((match = itemRegex.exec(xmlText)) && items.length < MAX_ITEMS) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title").trim() || "제목 없음";
    const link = toSafeUrl(extractTag(itemXml, "link").trim(), "");
    const pubDate = extractTag(itemXml, "pubDate").trim();
    const description = extractTag(itemXml, "description");
    const summaryRaw = normalizeText(description);

    items.push({
      id: `${link || "item"}-${index}`,
      title,
      link,
      pubDate,
      dateLabel: toDateLabel(pubDate),
      summary:
        summaryRaw.length > 92
          ? `${summaryRaw.slice(0, 92)}...`
          : summaryRaw || "포스팅 미리보기가 준비되지 않았습니다.",
      thumbnail: extractThumbnail(description, fallbackThumb),
    });

    index += 1;
  }

  return items;
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/xml,text/xml,application/json;q=0.9,*/*;q=0.8",
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchXmlWithFallback() {
  const errors = [];

  for (const url of proxyUrls) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        errors.push(`${url} -> HTTP ${response.status}`);
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json") || url.includes("/get?")) {
        const data = await response.json();
        const contents = data?.contents?.trim();
        if (!contents) {
          errors.push(`${url} -> empty JSON contents`);
          continue;
        }
        return contents;
      }

      const xmlText = (await response.text()).trim();
      if (!xmlText) {
        errors.push(`${url} -> empty response`);
        continue;
      }
      return xmlText;
    } catch (error) {
      const reason = error?.name === "AbortError" ? "timeout" : error?.message || "unknown";
      errors.push(`${url} -> ${reason}`);
    }
  }

  throw new Error(errors.join(" | "));
}

async function run() {
  const fallbackThumb = "/jm-motori/assets/images/3.jpg";

  try {
    const xmlText = await fetchXmlWithFallback();
    const items = parsePosts(xmlText, fallbackThumb);

    if (!items.length) {
      throw new Error("RSS parsing produced zero items");
    }

    const payload = {
      source: RSS_URL,
      generatedAt: new Date().toISOString(),
      itemCount: items.length,
      items,
    };

    await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`[rss-cache] updated ${OUTPUT_RELATIVE_PATH} (${items.length} items)`);
    return;
  } catch (error) {
    try {
      // Preserve build stability by keeping the last known good cache.
      await readFile(OUTPUT_PATH, "utf8");
      console.warn(`[rss-cache] fetch failed, keeping existing cache: ${error.message}`);
      return;
    } catch {
      throw new Error(`[rss-cache] fetch failed and no existing cache: ${error.message}`);
    }
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

