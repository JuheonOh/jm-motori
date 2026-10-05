function enhance(hero) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let savedMotion = null;
  try { savedMotion = localStorage.getItem('jm-v6-motion'); } catch {}
  let motion = savedMotion === null ? !preference.matches : savedMotion === 'true';
  document.documentElement.classList.add('v6');
  const imageUrl = new URL('./assets/images/hero.webp', import.meta.url).href;
  hero.insertAdjacentHTML('afterbegin', `<div class="v6-photo-stage" aria-hidden="true"><div class="v6-photo-frame"><img src="${imageUrl}" alt="" fetchpriority="high"></div></div>`);
  hero.insertAdjacentHTML('beforeend', `<div class="v6-hero-bottom"><a href="#services" class="v6-scroll-cue"><span aria-hidden="true">↓</span> 스크롤해서 둘러보기</a></div><button type="button" class="v6-motion-toggle" aria-pressed="${motion}">${motion ? '모션 끄기' : '모션 켜기'}</button>`);
  hero.querySelector('.hero-content').insertAdjacentHTML('afterbegin', '<p class="v6-kicker">JM MOTORI · GWANGJU</p>');
  const toggle = hero.querySelector('.v6-motion-toggle');
  function setMotion(enabled) {
    motion = enabled;
    document.documentElement.classList.toggle('v6-motion-off', !motion);
    toggle.setAttribute('aria-pressed', String(motion));
    toggle.textContent = motion ? '모션 끄기' : '모션 켜기';
    requestAnimationFrame(scroll);
    if (!motion) document.querySelectorAll('.v6-reveal').forEach(el => el.classList.add('v6-visible'));
  }
  toggle.addEventListener('click', () => {
    savedMotion = String(!motion);
    try { localStorage.setItem('jm-v6-motion', savedMotion); } catch {}
    setMotion(!motion);
  });
  preference.addEventListener('change', event => {
    if (savedMotion === null) setMotion(!event.matches);
  });
  setMotion(motion);

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('v6-visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  function prepareCards() {
    document.querySelectorAll('.repair-case:not([data-v6-ready]), .service-item:not([data-v6-ready]), #contact .section-heading:not([data-v6-ready])').forEach((item, index) => {
      item.dataset.v6Ready = 'true';
      item.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 90}ms`);
      item.classList.add('v6-reveal');
      if (!motion) item.classList.add('v6-visible');
      else observer.observe(item);
      if (item.classList.contains('repair-case')) {
        const link = item.querySelector('.case-link');
        link.addEventListener('pointermove', event => {
          if (!motion || event.pointerType !== 'mouse') return;
          const box = item.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width;
          const y = (event.clientY - box.top) / box.height;
          link.style.setProperty('--rx', `${(0.5 - y) * 7}deg`);
          link.style.setProperty('--ry', `${(x - 0.5) * 7}deg`);
        });
        link.addEventListener('pointerleave', () => { link.style.setProperty('--rx', '0deg'); link.style.setProperty('--ry', '0deg'); });
      }
    });
  }
  prepareCards();
  const feedObserver = new MutationObserver(prepareCards);
  feedObserver.observe(document.querySelector('#portfolio'), { childList: true, subtree: true });
  let frame = 0;
  const progress = document.createElement('div');
  progress.className = 'v6-reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  function scroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const distance = Math.max(1, hero.offsetHeight - hero.querySelector('.v6-photo-stage').offsetHeight);
      const amount = Math.min(1, Math.max(0, (scrollY - hero.offsetTop) / distance));
      hero.style.setProperty('--scene-progress', motion ? String(amount) : '0');
      progress.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
      frame = 0;
    });
  }
  addEventListener('scroll', scroll, { passive: true });
  addEventListener('resize', scroll);
  scroll();
  addEventListener('pagehide', event => {
    if (event.persisted) return;
    observer.disconnect(); feedObserver.disconnect();
    removeEventListener('resize', scroll);
    removeEventListener('scroll', scroll); cancelAnimationFrame(frame);
  }, { once: true });
}
const existing = document.querySelector('.hero');
if (existing) enhance(existing);
else {
  const boot = new MutationObserver(() => {
    const hero = document.querySelector('.hero');
    if (hero) { boot.disconnect(); enhance(hero); }
  });
  boot.observe(document.getElementById('root'), { childList: true, subtree: true });
}
