import MapPanel from "./components/MapPanel";
import { BLOG_URL, NAV_LINKS, NAVER_MAP_SEARCH_URL, SERVICES, STORE } from "./constants";
import { useBusinessStatus } from "./hooks/useBusinessStatus";
import { useRssPosts } from "./hooks/useRssPosts";

const baseUrl = import.meta.env.BASE_URL;
const image1 = `${baseUrl}assets/images/1.jpg`;
const image2 = `${baseUrl}assets/images/2.jpg`;
const image3 = `${baseUrl}assets/images/3.jpg`;
const rssFallbackImage = `${baseUrl}assets/images/3.jpg`;
const containerClass = "mx-auto w-[min(1120px,calc(100%-2rem))] max-[760px]:w-[min(1120px,calc(100%-1.2rem))]";

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
      <div className="rounded-[14px] border border-white/10 bg-[#15181b] px-4 py-9 text-center text-slate-400">
        <p>최신 정비 사례를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-rose-400/35 bg-rose-500/10 px-4 py-9 text-center text-rose-200">
        <p>
          최신 정비 사례를 자동으로 가져오지 못했습니다. 잠시 후 다시 시도하거나{" "}
          <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline">
            네이버 블로그
          </a>
          에서 직접 확인해 주세요.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-[#ffc107] px-4 py-3 text-[0.95rem] font-extrabold text-gray-900 shadow-[0_0_26px_rgba(255,193,7,0.25)] transition hover:brightness-95"
          onClick={refetch}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-5 max-[980px]:grid-cols-2 max-[760px]:grid-cols-1">
      {posts.map((post) => (
        <article
          className="overflow-hidden rounded-[14px] border border-white/10 bg-[#15181b] transition hover:border-[#ffc107]/50"
          key={post.id}
        >
          <a href={post.link} target="_blank" rel="noopener noreferrer">
            <div className="aspect-[16/10] overflow-hidden bg-slate-800">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
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
            <div className="p-4">
              <div className="mb-2 flex justify-between gap-2 text-xs text-slate-500">
                <span className="font-extrabold uppercase tracking-[0.16em] text-[#ffc107]">Repair Diary</span>
                <span>{post.dateLabel}</span>
              </div>
              <h3 className="overflow-hidden text-[1.06rem] font-extrabold leading-relaxed [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {post.title}
              </h3>
              <p className="mt-3 overflow-hidden text-[0.9rem] leading-relaxed text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                {post.summary}
              </p>
              <span className="mt-4 inline-block text-[0.9rem] font-bold text-[#ffc107]">자세히 보기</span>
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
      <nav className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-black/65 backdrop-blur">
        <div className={`${containerClass} flex min-h-20 items-center justify-between`}>
          <a href="#home">
            <p className="m-0 text-[1.8rem] font-black uppercase tracking-[0.08em]">
              <span className="text-[#ffc107]">JM</span>MOTORI
            </p>
            <p className="m-0 text-[0.62rem] font-bold uppercase tracking-[0.28em] text-slate-400">
              BMW & MINI Specialist
            </p>
          </a>

          <div className="flex items-center gap-6 text-[0.95rem] font-semibold text-slate-300">
            {NAV_LINKS.map((link) => (
              <a href={link.href} key={link.href} className="max-[760px]:hidden hover:text-[#ffc107]">
                {link.label}
              </a>
            ))}
            <a
              href={`tel:${STORE.phone}`}
              className="inline-flex items-center justify-center rounded-[10px] bg-[#ffc107] px-4 py-3 text-[0.95rem] font-extrabold text-gray-900 shadow-[0_0_26px_rgba(255,193,7,0.25)] transition hover:brightness-95"
              aria-label="전화 상담 연결"
            >
              전화 상담
            </a>
          </div>
        </div>
      </nav>

      <main id="home" className="bg-[#212529] text-slate-50">
        <header className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${image2})` }}>
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.86)_20%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.72)_100%)]" />
          <div className={`${containerClass} relative z-[1] flex min-h-screen max-w-[850px] flex-col justify-center pt-28`}>
            <p className="mb-5 w-fit rounded-full border border-[#ffc107]/40 bg-[#ffc107]/15 px-3 py-2 text-[0.72rem] font-bold tracking-[0.18em] text-[#ffc107]">
              GWANGJU BMW·MINI WORKSHOP
            </p>
            <h1 className="m-0 text-[clamp(2.05rem,6.4vw,4.35rem)] font-black leading-[1.1]">
              미니쿠퍼·BMW 전문 <br className="hidden md:block" /> <span className="text-[#ffc107]">정직하고 정확한 정비</span>
            </h1>
            <p className="mt-6 max-w-[720px] leading-[1.7] text-slate-200">
              실제 매장 환경과 네이버 블로그의 최신 정비 사례를 실시간으로 연결해, 방문 전에도 정비 퀄리티를
              확인할 수 있도록 구성한 JM MOTORI 공식 SPA입니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${STORE.phone}`}
                className="inline-flex items-center justify-center rounded-[10px] bg-[#ffc107] px-6 py-4 text-[1.04rem] font-extrabold text-gray-900 shadow-[0_0_26px_rgba(255,193,7,0.25)] transition hover:brightness-95 max-[760px]:w-full"
              >
                {STORE.phone} 바로 전화
              </a>
              <a
                href="#portfolio"
                className="inline-flex items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-6 py-4 text-[1.04rem] font-extrabold text-white transition hover:border-[#ffc107]/60 hover:text-[#ffc107] max-[760px]:w-full"
              >
                최신 정비 사례 보기
              </a>
            </div>
          </div>
        </header>

        <section id="services" className="border-y border-white/10 py-20 [background-color:rgba(21,24,27,0.62)] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:18px_18px]">
          <div className={containerClass}>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#ffc107]">Core Services</p>
            <h2 className="m-0 text-[clamp(1.7rem,4.8vw,2.3rem)] font-black">BMW & MINI 전용 정비 서비스</h2>
            <div className="mt-6 grid grid-cols-4 gap-4 max-[980px]:grid-cols-2 max-[760px]:grid-cols-1">
              {SERVICES.map((service) => (
                <article className="rounded-[14px] border border-white/10 bg-black/35 p-5" key={service.title}>
                  <h3 className="m-0 text-[1.04rem] text-[#ffc107]">{service.title}</h3>
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-slate-300">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="border-t border-white/10 bg-slate-950 py-20">
          <div className={containerClass}>
            <div className="mb-6 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
              <div>
                <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#ffc107]">Live Portfolio</p>
                <h2 className="m-0 text-[clamp(1.7rem,4.8vw,2.3rem)] font-black">네이버 블로그 최신 정비 사례</h2>
                <p className="mt-3 text-[0.95rem] text-slate-400">
                  ablymotors RSS를 실시간 파싱해 최신 포스팅을 카드로 자동 노출합니다.
                </p>
              </div>
              <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="text-[0.92rem] font-bold text-[#ffc107] hover:underline">
                블로그 전체 보기
              </a>
            </div>
            <BlogCards />
          </div>
        </section>

        <section id="contact" className="border-t border-white/10 py-20">
          <div className={containerClass}>
            <div className="mb-6 text-center">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#ffc107]">Location & Contact</p>
              <h2 className="m-0 text-[clamp(1.7rem,4.8vw,2.3rem)] font-black">광주 광산구 JM MOTORI</h2>
            </div>
            <div className="grid grid-cols-[1.05fr_0.95fr] gap-4 max-[980px]:grid-cols-1">
              <div>
                <div className="mb-4 grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
                  <img src={image1} alt="JM MOTORI 외관" loading="lazy" className="h-40 w-full rounded-xl object-cover max-[760px]:h-[180px]" />
                  <img src={image3} alt="JM MOTORI 매장 전경" loading="lazy" className="h-40 w-full rounded-xl object-cover max-[760px]:h-[180px]" />
                  <img src={image2} alt="JM MOTORI 정비 작업" loading="lazy" className="h-40 w-full rounded-xl object-cover max-[760px]:h-[180px]" />
                </div>
                <article className="rounded-[14px] border border-white/10 bg-[#15181b] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="m-0 text-[1.05rem] text-[#ffc107]">매장 정보</h3>
                    <span className={businessStatus.className}>{businessStatus.text}</span>
                  </div>
                  <dl className="mt-4 grid gap-4">
                    <div>
                      <dt className="mb-1 text-[0.9rem] font-bold text-slate-300">주소</dt>
                      <dd className="m-0 text-[0.92rem] leading-relaxed text-slate-200">{STORE.address}</dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-[0.9rem] font-bold text-slate-300">연락처</dt>
                      <dd className="m-0 text-[0.92rem] leading-relaxed text-slate-200">
                        <a href={`tel:${STORE.phone}`} className="font-bold text-[#ffc107]">
                          {STORE.phone}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-[0.9rem] font-bold text-slate-300">영업시간</dt>
                      <dd className="m-0 text-[0.92rem] leading-relaxed text-slate-200">{STORE.openHours}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-[10px] bg-[#e31837] px-4 py-3 text-[0.95rem] font-extrabold text-white transition hover:brightness-95"
                      onClick={() => openNavigation("tmap")}
                      aria-label="T맵 길안내 열기"
                    >
                      T맵 길안내
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-[10px] bg-[#fee500] px-4 py-3 text-[0.95rem] font-extrabold text-[#191600] transition hover:brightness-95"
                      onClick={() => openNavigation("kakao")}
                      aria-label="카카오내비 길안내 열기"
                    >
                      카카오내비
                    </button>
                    <a
                      href={NAVER_MAP_SEARCH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-[10px] bg-[#03c75a] px-4 py-3 text-[0.95rem] font-extrabold text-white transition hover:brightness-95"
                    >
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

      <footer className="border-t border-white/10 bg-black p-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} JM MOTORI. BMW & MINI Specialist in Gwangju.
      </footer>
    </>
  );
}
