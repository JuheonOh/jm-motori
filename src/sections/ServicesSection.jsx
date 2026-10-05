import { SERVICES } from "../constants";

export default function ServicesSection({ containerClass }) {
  return (
    <section id="services" className="services-section">
      <div className={`${containerClass} services-layout`}>
        <div className="services-intro">
          <p className="section-kicker">01 / SERVICE</p>
          <h2>내 차에 필요한<br />정비를 만나다.</h2>
          <p>주기적인 관리부터 낯선 증상의 점검까지.<br />차량의 상태에 맞는 정비를 상담하세요.</p>
          <a href="#contact" className="text-link">매장 안내 <span aria-hidden="true">↗</span></a>
        </div>
        <div className="service-grid">
          {SERVICES.map((service, index) => (
            <article className="service-item" key={service.title}>
              <span className="service-number">0{index + 1}</span>
              <div><h3>{service.title}</h3><p>{service.description.split(" · ").map((item) => <span className="service-detail" key={item}>{item}</span>)}</p></div>
              <span className="service-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
