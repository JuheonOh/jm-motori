import { BLOG_URL } from "../constants";
import BlogCards from "../components/blog/BlogCards";

export default function PortfolioSection({ containerClass }) {
  return (
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
          <a
            href={BLOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.92rem] font-bold text-[#ffc107] hover:underline"
          >
            블로그 전체 보기
          </a>
        </div>
        <BlogCards />
      </div>
    </section>
  );
}
