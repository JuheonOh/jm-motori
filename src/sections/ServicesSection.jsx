import { SERVICES } from "../constants";

export default function ServicesSection({ containerClass }) {
  return (
    <section
      id="services"
      className="border-y border-white/10 py-20 [background-color:rgba(21,24,27,0.62)] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:18px_18px]"
    >
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
  );
}
