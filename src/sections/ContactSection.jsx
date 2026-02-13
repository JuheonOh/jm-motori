import MapPanel from "../components/MapPanel";
import { NAVER_MAP_SEARCH_URL, STORE } from "../constants";
import { openNavigation } from "../utils/navigation";

export default function ContactSection({ containerClass, image1, image2, image3, businessStatus }) {
  return (
    <section id="contact" className="border-t border-white/10 py-20">
      <div className={containerClass}>
        <div className="mb-6 text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#ffc107]">Location & Contact</p>
          <h2 className="m-0 text-[clamp(1.7rem,4.8vw,2.3rem)] font-black">광주 광산구 JM MOTORI</h2>
        </div>
        <div className="grid grid-cols-[1.05fr_0.95fr] gap-4 max-[980px]:grid-cols-1">
          <div>
            <div className="mb-4 grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
              <img
                src={image1}
                alt="JM MOTORI 외관"
                loading="lazy"
                className="h-40 w-full rounded-xl object-cover max-[760px]:h-45"
              />
              <img
                src={image3}
                alt="JM MOTORI 매장 전경"
                loading="lazy"
                className="h-40 w-full rounded-xl object-cover max-[760px]:h-45"
              />
              <img
                src={image2}
                alt="JM MOTORI 정비 작업"
                loading="lazy"
                className="h-40 w-full rounded-xl object-cover max-[760px]:h-45"
              />
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
              <div className="mt-4 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                <a
                  href={NAVER_MAP_SEARCH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#03c75a] px-4 py-3 text-[0.95rem] font-extrabold text-white transition hover:brightness-95"
                >
                  네이버지도
                </a>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#fee500] px-4 py-3 text-[0.95rem] font-extrabold text-[#191600] transition hover:brightness-95"
                  onClick={() => openNavigation("kakao")}
                  aria-label="카카오내비 길안내 열기"
                >
                  카카오내비
                </button>
              </div>
            </article>
          </div>
          <MapPanel />
        </div>
      </div>
    </section>
  );
}
