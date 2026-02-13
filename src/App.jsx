import MapPanel from "./components/MapPanel";
import { BLOG_URL, NAV_LINKS, NAVER_MAP_SEARCH_URL, SERVICES, STORE } from "./constants";
import { useBusinessStatus } from "./hooks/useBusinessStatus";
import { useRssPosts } from "./hooks/useRssPosts";

const baseUrl = import.meta.env.BASE_URL;
const image1 = `${baseUrl}assets/images/1.jpg`;
const image2 = `${baseUrl}assets/images/2.jpg`;
const image3 = `${baseUrl}assets/images/3.jpg`;
const rssFallbackImage = `${baseUrl}assets/images/3.jpg`;

function openNavigation(provider) {
  const appLinks = {
    tmap: `tmap://route?goalname=${encodeURIComponent(STORE.name)}&goalx=${STORE.lng}&goaly=${STORE.lat}`,
    kakao: `kakaonavi://navigate?name=${encodeURIComponent(STORE.name)}&x=${STORE.lng}&y=${STORE.lat}`,
  };

  const webFallbackByProvider = {
    tmap: NAVER_MAP_SEARCH_URL,
    kakao: `https://map.kakao.com/link/to/${encodeURIComponent(STORE.name)},${STORE.lat},${STORE.lng}`,
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

function BlogCards() {
  const { posts, loading, error, refetch } = useRssPosts();

  if (loading) {
    return (
      <div className="status-panel">
        <p>최신 정비 사례를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-panel status-panel-error">
        <p>
          최신 정비 사례를 자동으로 가져오지 못했습니다. 잠시 후 다시 시도하거나{" "}
          <a href={BLOG_URL} target="_blank" rel="noopener noreferrer">
            네이버 블로그
          </a>
          에서 직접 확인해 주세요.
        </p>
        <button type="button" className="btn btn-primary retry-btn" onClick={refetch}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="blog-grid">
      {posts.map((post) => (
        <article className="blog-card" key={post.id}>
          <a href={post.link} target="_blank" rel="noopener noreferrer">
            <div className="blog-thumb-wrap">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="blog-thumb"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(event) => {
                  const img = event.currentTarget;
                  if (img.src !== rssFallbackImage) {
                    img.src = rssFallbackImage;
                  }
                }}
              />
            </div>
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-label">Repair Diary</span>
                <span>{post.dateLabel}</span>
              </div>
              <h3 className="line-clamp-2">{post.title}</h3>
              <p className="line-clamp-3">{post.summary}</p>
              <span className="blog-link">자세히 보기</span>
            </div>
          </a>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const businessStatus = useBusinessStatus();

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <a href="#home" className="brand">
            <p className="brand-main">
              <span>JM</span>MOTORI
            </p>
            <p className="brand-sub">BMW & MINI Specialist</p>
          </a>

          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
            <a href={`tel:${STORE.phone}`} className="btn btn-primary nav-call" aria-label="전화 상담 연결">
              전화 상담
            </a>
          </div>
        </div>
      </nav>

      <main id="home">
        <header className="hero" style={{ backgroundImage: `url(${image2})` }}>
          <div className="hero-overlay" />
          <div className="container hero-content">
            <p className="hero-chip">GWANGJU BMW·MINI WORKSHOP</p>
            <h1>
              미니쿠퍼·BMW 전문 <br className="hidden md:block" /> <span>정직하고 정확한 정비</span>
            </h1>
            <p>
              실제 매장 환경과 네이버 블로그의 최신 정비 사례를 실시간으로 연결해, 방문 전에도 정비 퀄리티를 확인할 수
              있도록 구성한 JM MOTORI 공식 SPA입니다.
            </p>
            <div className="hero-actions">
              <a href={`tel:${STORE.phone}`} className="btn btn-primary btn-large">
                {STORE.phone} 바로 전화
              </a>
              <a href="#portfolio" className="btn btn-ghost btn-large">
                최신 정비 사례 보기
              </a>
            </div>
          </div>
        </header>

        <section id="services" className="section section-grid-bg">
          <div className="container">
            <p className="section-label">Core Services</p>
            <h2>BMW & MINI 전용 정비 서비스</h2>
            <div className="service-grid">
              {SERVICES.map((service) => (
                <article className="service-card" key={service.title}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="section section-dark">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="section-label">Live Portfolio</p>
                <h2>네이버 블로그 최신 정비 사례</h2>
                <p className="section-copy">ablymotors RSS를 실시간 파싱해 최신 포스팅을 카드로 자동 노출합니다.</p>
              </div>
              <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="section-anchor">
                블로그 전체 보기
              </a>
            </div>
            <BlogCards />
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container">
            <div className="section-head-center">
              <p className="section-label">Location & Contact</p>
              <h2>광주 광산구 JM MOTORI</h2>
            </div>
            <div className="contact-layout">
              <div className="contact-left">
                <div className="image-grid">
                  <img src={image1} alt="JM MOTORI 외관" loading="lazy" />
                  <img src={image3} alt="JM MOTORI 매장 전경" loading="lazy" />
                  <img src={image2} alt="JM MOTORI 정비 작업" loading="lazy" />
                </div>
                <article className="store-card">
                  <div className="store-card-head">
                    <h3>매장 정보</h3>
                    <span className={businessStatus.className}>{businessStatus.text}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>주소</dt>
                      <dd>{STORE.address}</dd>
                    </div>
                    <div>
                      <dt>연락처</dt>
                      <dd>
                        <a href={`tel:${STORE.phone}`}>{STORE.phone}</a>
                      </dd>
                    </div>
                    <div>
                      <dt>영업시간</dt>
                      <dd>{STORE.openHours}</dd>
                    </div>
                  </dl>
                  <div className="nav-actions">
                    <button
                      type="button"
                      className="btn btn-tmap"
                      onClick={() => openNavigation("tmap")}
                      aria-label="T맵 길안내 열기"
                    >
                      T맵 길안내
                    </button>
                    <button
                      type="button"
                      className="btn btn-kakao"
                      onClick={() => openNavigation("kakao")}
                      aria-label="카카오내비 길안내 열기"
                    >
                      카카오내비
                    </button>
                    <a href={NAVER_MAP_SEARCH_URL} target="_blank" rel="noopener noreferrer" className="btn btn-naver">
                      네이버지도
                    </a>
                  </div>
                </article>
              </div>
              <MapPanel />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} JM MOTORI. BMW & MINI Specialist in Gwangju.</footer>
    </>
  );
}
