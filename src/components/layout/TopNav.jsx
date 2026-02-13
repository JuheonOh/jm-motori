import { useState } from "react";
import { NAV_LINKS, STORE } from "../../constants";

export default function TopNav({ containerClass }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-100 border-b border-white/10 bg-black/65 backdrop-blur">
      <div className={`${containerClass} flex min-h-20 items-center justify-between gap-2`}>
        <a href="#home" onClick={closeMobileMenu}>
          <p className="m-0 text-[1.8rem] font-extrabold uppercase tracking-[0.08em] text-white">
            <span className="text-[#ffc107]">JM</span>모토리
          </p>
          <p className="m-0 text-[0.62rem] font-bold uppercase tracking-[0.28em] text-slate-400">
            BMW & MINI Specialist
          </p>
        </a>

        <div className="hidden items-center gap-6 text-[0.95rem] font-semibold text-slate-300 min-[761px]:flex">
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

        <div className="flex items-center gap-2 min-[761px]:hidden">
          <a
            href={`tel:${STORE.phone}`}
            className="inline-flex items-center justify-center rounded-[10px] bg-[#ffc107] px-3.5 py-2.5 text-[0.86rem] font-extrabold text-gray-900 shadow-[0_0_26px_rgba(255,193,7,0.25)] transition hover:brightness-95"
            aria-label="전화 상담 연결"
          >
            전화
          </a>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-3 py-2.5 text-[0.84rem] font-bold text-white transition hover:border-[#ffc107]/60 hover:text-[#ffc107]"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={handleToggleMobileMenu}
          >
            {mobileMenuOpen ? "닫기" : "메뉴"}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`${containerClass} pb-3 min-[761px]:hidden`}>
          <div id="mobile-nav-menu" className="rounded-xl border border-white/10 bg-[#111316]/95 p-2.5">
            {NAV_LINKS.map((link) => (
              <a
                href={link.href}
                key={link.href}
                onClick={closeMobileMenu}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/8 hover:text-[#ffc107]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
