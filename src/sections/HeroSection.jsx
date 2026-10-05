import { STORE } from "../constants";

export default function HeroSection({ containerClass, backgroundImageUrl }) {
  return (
    <header className="hero">
      <div className={`${containerClass} hero-layout`}>
        <div className="hero-content">
          <p className="eyebrow"><span /> 광주 광산구 우산동 · 자동차 정비소</p>
          <h1 className="hero-title">당신의 차와<br />오래, 함께.<br /><span>JM모토리</span></h1>
          <p className="hero-description">일상의 오일 교환부터 경고등, 진동, 누유 점검까지.<br />광주 우산동에서 만나는 자동차 정비소입니다.</p>
          <div className="hero-actions">
            <a href={`tel:${STORE.phone}`} className="button-primary">전화 상담 <span aria-hidden="true">↗</span></a>
            <a href="#portfolio" className="text-link">정비 사례 둘러보기 <span aria-hidden="true">→</span></a>
          </div>
          <div className="hero-note"><span>방문 전 문의</span><strong>{STORE.phone}</strong></div>
        </div>
        <figure className="hero-photo">
          <img src={backgroundImageUrl} alt="JM모토리 간판과 작업장 앞에 주차된 MINI 차량들" fetchPriority="high" width="1448" height="1086" />
          <figcaption><span>JM MOTORI · GWANGJU</span><span>우리의 정비 공간 <span aria-hidden="true">↗</span></span></figcaption>
          <a href="#contact" className="photo-label">광주 우산동에서<br /><strong>만나요 <span aria-hidden="true">↘</span></strong></a>
        </figure>
      </div>
      <div className="hero-strip"><div className={containerClass}><span>자동차를 돌보는 일, <strong>JM모토리의 일.</strong></span><a href="#services">정비 서비스 알아보기 <span aria-hidden="true">↓</span></a></div></div>
    </header>
  );
}
