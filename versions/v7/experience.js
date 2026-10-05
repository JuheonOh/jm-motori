function enhance(hero) {
  const photo = new URL('./assets/images/hero.webp', import.meta.url).href;
  hero.insertAdjacentHTML('beforeend', `<figure class="v7-photo"><img src="${photo}" alt="JM모토리 매장과 앞에 주차된 MINI 차량들" fetchpriority="high" width="1448" height="1086"><figcaption><span>THE WORKSHOP</span><span>광주 광산구 우산동 ↗</span></figcaption></figure>`);
  hero.querySelector('.hero-content').insertAdjacentHTML('afterbegin', '<p class="v7-eyebrow"><span></span> GWANGJU · AUTO WORKSHOP</p>');
  hero.insertAdjacentHTML('afterend', '<div class="v7-strip"><span>일상의 관리부터, 낯선 증상의 점검까지.</span><a href="#services">JM모토리의 정비 서비스 <span aria-hidden="true">↓</span></a></div>');
  document.querySelectorAll('.service-item').forEach((item, index) => {
    item.insertAdjacentHTML('afterbegin', `<span class="v7-number">0${index + 1}</span>`);
  });
  for (const [id, label] of [['services', '01 / SERVICE'], ['portfolio', '02 / WORK LOG'], ['contact', '03 / VISIT']]) {
    document.querySelector(`#${id} .section-heading h2`)?.insertAdjacentHTML('beforebegin', `<p class="v7-section-label">${label}</p>`);
  }
}
const hero = document.querySelector('.hero');
if (hero) enhance(hero);
else {
  const boot = new MutationObserver(() => {
    const hero = document.querySelector('.hero');
    if (hero) { boot.disconnect(); enhance(hero); }
  });
  boot.observe(document.getElementById('root'), { childList: true, subtree: true });
}
