import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RSS_URL = "https://rss.blog.naver.com/ablymotors.xml";
const REQUEST_TIMEOUT_MS = 12000;
const OUTPUT_RELATIVE_PATH = path.join("public", "data", "blog-feed.json");
const MAX_ITEMS = 12;
const THUMB_PROXY_BASE = "https://wsrv.nl/?url=";
const THUMB_PROXY_PARAMS = "&w=960&h=720&fit=contain&output=webp&q=80";
const COMPARE_URL = process.env.RSS_CACHE_COMPARE_URL || "";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT_DIR, OUTPUT_RELATIVE_PATH);

const proxyUrls = [
  RSS_URL,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`,
  `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`,
];

function decodeHtmlEntities(input) {
  const named = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
  return input.replace(/&(#x[0-9a-f]+|#[0-9]+|lt|gt|amp|quot|apos);/gi, (entity, code) => {
    if (!code.startsWith("#")) return named[code] ?? entity;
    const point = code[1].toLowerCase() === "x"
      ? Number.parseInt(code.slice(2), 16)
      : Number.parseInt(code.slice(1), 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point)
      : entity;
  });
}

function extractTag(block, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = block.match(regex);
  if (!match) return "";
  // CDATA is literal XML text; decode only the surrounding XML segments once.
  return match[1].split(/(<!\[CDATA\[[\s\S]*?\]\]>)/g)
    .map((part) => part.startsWith("<![CDATA[") ? part.slice(9, -3) : decodeHtmlEntities(part))
    .join("");
}

function normalizeText(htmlText) {
  return decodeHtmlEntities(htmlText.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
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

function toThumbnailProxyUrl(url, fallback = "") {
  const safeUrl = toSafeUrl(url, fallback);
  if (!safeUrl || safeUrl === fallback) return fallback;
  if (safeUrl.startsWith("/")) return safeUrl;
  if (safeUrl.includes("wsrv.nl/?url=")) return safeUrl;

  const protocolLessUrl = safeUrl.replace(/^https?:\/\//i, "");
  return `${THUMB_PROXY_BASE}${encodeURIComponent(protocolLessUrl)}${THUMB_PROXY_PARAMS}`;
}

function extractThumbnail(descriptionHtml, fallbackThumb) {
  const match = descriptionHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return fallbackThumb;
  return toThumbnailProxyUrl(decodeHtmlEntities(match[1]), fallbackThumb);
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

function toComparableFeed(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return JSON.stringify({
    source: payload?.source || RSS_URL,
    itemCount: items.length,
    items: items.map((item) => ({
      id: item?.id || "",
      title: item?.title || "",
      link: item?.link || "",
      pubDate: item?.pubDate || "",
      dateLabel: item?.dateLabel || "",
      summary: item?.summary || "",
      thumbnail: item?.thumbnail || "",
    })),
  });
}

async function writeGitHubOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  await appendFile(outputPath, `${name}=${value}\n`, "utf8");
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

async function fetchPublishedPayload() {
  if (!COMPARE_URL) return null;

  const response = await fetchWithTimeout(COMPARE_URL);
  if (!response.ok) {
    throw new Error(`compare cache HTTP ${response.status}`);
  }

  return await response.json();
}

async function detectFeedChanged(payload) {
  if (!COMPARE_URL) {
    return { changed: true, reason: "compare URL not configured" };
  }

  try {
    const publishedPayload = await fetchPublishedPayload();
    const changed = toComparableFeed(payload) !== toComparableFeed(publishedPayload);
    return { changed, reason: changed ? "RSS cache differs from published cache" : "RSS cache unchanged" };
  } catch (error) {
    return { changed: true, reason: error?.message || "published cache compare failed" };
  }
}

async function run() {
  // Keep this project-relative so runtime can resolve BASE_URL correctly.
  const fallbackThumb = "assets/images/3.jpg";

  let items;
  try {
    const xmlText = await fetchXmlWithFallback();
    items = parsePosts(xmlText, fallbackThumb);
    if (!items.length) throw new Error("RSS parsing produced zero items");
  } catch (error) {
    try {
      // Only a usable previous feed can safely replace an unavailable upstream.
      const cached = JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
      if (!Array.isArray(cached.items) || !cached.items.length || !cached.items.every((item) => {
        if (typeof item?.title !== "string" || !item.title.trim() || typeof item.link !== "string") return false;
        try { return ["http:", "https:"].includes(new URL(item.link).protocol); }
        catch { return false; }
      })) throw new Error("cache has no usable items");
    } catch (cacheError) {
      throw new Error(`[rss-cache] fetch failed: ${error.message}; no usable cache: ${cacheError.message}`);
    }
    console.warn(`[rss-cache] fetch failed, keeping existing cache: ${error.message}`);
    await writeGitHubOutput("rss_changed", "false");
    return;
  }

  const payload = {
    source: RSS_URL,
    generatedAt: new Date().toISOString(),
    itemCount: items.length,
    items,
  };
  const { changed, reason } = await detectFeedChanged(payload);

  // Publishing failures must fail CI, not masquerade as upstream outages.
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`[rss-cache] updated ${OUTPUT_RELATIVE_PATH} (${items.length} items)`);
  console.log(`[rss-cache] ${reason}`);
  await writeGitHubOutput("rss_changed", changed ? "true" : "false");
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
