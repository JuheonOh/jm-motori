import { NAV_LINKS, STORE } from "../../constants";

export default function TopNav({ containerClass }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-100 border-b border-white/10 bg-black/65 backdrop-blur">
      <div className={`${containerClass} flex min-h-20 items-center justify-between`}>
        <a href="#home">
          <p className="m-0 text-[1.8rem] font-extrabold uppercase tracking-[0.08em] text-white">
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
  );
}
