import MapPanel from "../components/MapPanel";
import { NAVER_MAP_SEARCH_URL, STORE } from "../constants";
import { openNavigation } from "../utils/navigation";

export default function ContactSection({ containerClass, businessStatus }) {
  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-heading">
      <div className={containerClass}>
        <div className="section-heading">
          <div><p className="section-kicker">03 / VISIT</p>
          <h2 id="contact-heading">오시는 길</h2></div>
          <p>차에 관한 고민, 가까운 곳에서 함께 살펴보겠습니다.</p>
        </div>
        <div className="contact-layout">
          <div className="contact-info">
            <div className="contact-status">
              <h3>JM MOTORI</h3>
              <span className={businessStatus.className}>{businessStatus.text}</span>
            </div>
            <dl className="contact-details">
              <div>
                <dt>주소</dt>
                <dd>{STORE.address}</dd>
              </div>
              <div>
                <dt>전화 문의</dt>
                <dd><a href={`tel:${STORE.phone}`}>{STORE.phone}</a></dd>
              </div>
              <div>
                <dt>영업시간</dt>
                <dd>
                  {STORE.openHours.split(" / ").map((hours) => (
                    <span key={hours}>{hours}</span>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="contact-links">
              <a href={NAVER_MAP_SEARCH_URL} target="_blank" rel="noopener noreferrer">
                네이버지도 <span aria-hidden="true">↗</span>
              </a>
              <button type="button" onClick={() => openNavigation("kakao")} aria-label="카카오내비 길안내 열기">
                카카오내비 <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
          <MapPanel />
        </div>
      </div>
    </section>
  );
}
