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
    <nav aria-label="주요 메뉴" onKeyDown={(event) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        closeMobileMenu();
        event.currentTarget.querySelector("button[aria-controls]")?.focus();
      }
    }} className="site-nav">
      <div className={`${containerClass} nav-inner`}>
        <a href="#home" className="brand" onClick={closeMobileMenu}>
          <img
            src={`${import.meta.env.BASE_URL}assets/brand/logo.png`}
            alt="JM모토리 로고"
            width="160"
            height="40"
            className="h-10 w-auto max-[360px]:h-8"
          />
        </a>

        <div className="desktop-nav">
          {NAV_LINKS.map((link) => (
            <a href={link.href} key={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
          <a
            href={`tel:${STORE.phone}`}
            className="nav-phone"
            aria-label="전화 상담 연결"
          >
            전화 상담
          </a>
        </div>

        <div className="mobile-controls">
          <a
            href={`tel:${STORE.phone}`}
            className="nav-phone"
            aria-label="전화 상담 연결"
          >
            전화
          </a>
          <button
            type="button"
            className="menu-toggle"
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
          <div id="mobile-nav-menu" className="mobile-menu">
            {NAV_LINKS.map((link) => (
              <a
                href={link.href}
                key={link.href}
                onClick={closeMobileMenu}
                className="mobile-menu-link"
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
