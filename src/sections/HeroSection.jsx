import { STORE } from "../constants";

export default function HeroSection({ containerClass, backgroundImageUrl }) {
  return (
    <header
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.86)_20%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.72)_100%)]" />
      <div className={`${containerClass} relative z-1 flex min-h-screen max-w-212.5 flex-col justify-center pt-28`}>
        <p className="mb-5 w-fit rounded-full border border-[#ffc107]/40 bg-[#ffc107]/15 px-3 py-2 text-[0.72rem] font-bold tracking-[0.18em] text-[#ffc107]">
          GWANGJU BMW·MINI WORKSHOP
        </p>
        <h1 className="m-0 text-[clamp(2.05rem,6.4vw,4.35rem)] font-black leading-[1.1]">
          BMW·미니쿠퍼 전문 <br className="hidden md:block" />{" "}
          <span className="text-[#ffc107]">정직하고 정확한 정비</span>
        </h1>
        <p className="mt-6 max-w-180 leading-[1.7] text-slate-200">
          실제 매장 환경과 네이버 블로그의 최신 정비 사례를 한눈에 확인할 수 있도록 구성한 JM MOTORI 공식 정비 안내
          페이지입니다.
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
  );
}
