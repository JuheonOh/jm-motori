(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const multiline = value => escape(value).replace(/\n/g, '<br>');
  const dateLabel = value => escape(String(value).replaceAll('-', '.'));
  const pad = value => String(value).padStart(2, '0');
  const pageSize = 6;
  const config = window.JM_CONFIG || {};
  const assets = window.JM_ASSETS || {};
  let feed = window.JM_FEED;
  const state = {brand:'MINI', symptom:'all', query:'', limit:pageSize, list:false};
  const labels = new Map();
  let lastFocused = null, toastTimer;
  const services = [
    {id:'warning',title:'경고등 · 정밀 진단',description:'엔진 · 구동장치 · 배터리 경고\n진단 장비를 통한 상태 확인',icon:'<path d="M9 5h8M13 5v4M6 12H3v7h3m0-9h11l4 4h3v8h-3l-3 3H9l-3-4V10Z"/><path d="m14 12-3 6h5l-3 6"/>'},
    {id:'vibration',title:'진동 · 소음',description:'엔진마운트 · 미션마운트\n댐퍼풀리 · 하체 소음 점검',icon:'<path d="M3 15h4l3-8 5 17 4-13 3 4h5"/><path d="M4 5v3m0 14v3m22-20v3m0 14v3"/>'},
    {id:'leak',title:'누유 · 냉각계통',description:'엔진오일 누유 · 냉각수 누수\n하우징 · 워터펌프 등 점검',icon:'<path d="M15 3C12 8 6 13 6 19a9 9 0 0 0 18 0C24 13 18 8 15 3Z"/><path d="M10 19a5 5 0 0 0 5 5"/>'},
    {id:'oil',title:'오일 · 메인터넌스',description:'엔진오일 · 미션오일 교환\n냉각수 · 소모품 주기 관리',icon:'<path d="M9 4h9v5l5 4v13H6V9h3V4Zm0 0v5h9M9 13h8v7H9Z"/><path d="M23 6c0 0 4 4 4 6a2 2 0 0 1-4 0c0-2 4-6 4-6"/>'},
    {id:'diesel',title:'DPF · EGR · 디젤',description:'DPF · EGR 계통 점검\n크리닝 · 터보 관련 정비',icon:'<rect x="8" y="7" width="14" height="17" rx="2"/><path d="M3 11h5m14 0h5M3 20h5m14 0h5M12 11v9m5-9v9"/>'},
    {id:'brake',title:'브레이크',description:'패드 · 디스크 교환\n제동 시 소음 · 경고등 점검',icon:'<circle cx="15" cy="15" r="10"/><circle cx="15" cy="15" r="3"/><path d="M12 9h1m5 2h1m-7 9h1m5-2h1M23 6l3 3v12l-3 3"/>'}
  ];
  function validPostUrl(value) {
    try {const u=new URL(value); return u.protocol==='https:'&&u.hostname==='blog.naver.com'&&/^\/ablymotors\/\d+$/.test(u.pathname)?u.href:'https://blog.naver.com/ablymotors';}
    catch {return 'https://blog.naver.com/ablymotors';}
  }
  function validImageUrl(value) {
    if (typeof value !== 'string') return '';
    // Only trusted build-time image data or known source hosts can become image URLs.
    if (/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)) return value;
    try {const u=new URL(value);return u.protocol==='https:'&&(u.hostname.endsWith('.pstatic.net')||u.hostname.endsWith('.phinf.naver.net')||u.hostname==='jm-motori.co.kr')?u.href:'';}
    catch {return '';}
  }
  function validFeed(value) {
    return value&&Array.isArray(value.posts)&&value.posts.length>0&&value.posts.length<=1000&&Array.isArray(value.filters)&&typeof value.meta?.snapshotAt==='string'&&value.posts.every(p=>['id','title','originalTitle','model','brand','work','excerpt','date','url'].every(k=>typeof p[k]==='string')&&Array.isArray(p.symptoms)&&p.symptoms.every(s=>typeof s==='string')&&Array.isArray(p.tags)&&p.tags.every(t=>typeof t==='string'))&&value.filters.every(f=>typeof f.id==='string'&&typeof f.label==='string');
  }
  function mediaInit(root=document) {
    $$('[data-media] > img',root).forEach(img=>{
      if(img.dataset.bound) return;
      img.dataset.bound='true';
      const parent=img.parentElement;
      const loaded=()=>{if(img.naturalWidth>0){parent.classList.add('is-loaded');parent.classList.remove('image-unavailable');$('.photo-fail',parent)?.setAttribute('hidden','');img.removeAttribute('aria-hidden');}};
      const failed=()=>{parent.classList.add('image-unavailable');img.setAttribute('aria-hidden','true');const note=$('.photo-fail',parent)||$('.card-fail-note',parent);if(note){note.hidden=false;note.textContent='사진을 불러오지 못했습니다';}};
      img.addEventListener('load',loaded);
      img.addEventListener('error',failed);
      if(img.complete){if(img.naturalWidth>0) loaded();else failed();}
    });
  }
  function coverMarkup(post,index=0,className='card-photo') {
    const photo=validImageUrl(assets[`post:${post.id}`]||post.image);
    const name=post.model.replace(/^MINI\s+/,'').replace(/^MERCEDES\s+/,'');
    const compactName=name.replace('COUNTRYMAN','COUNTRY\nMAN').replace('CLUBMAN','CLUB\nMAN');
    return `<div class="${className} media" data-media>
      <div class="photo-fallback card-fallback tone-${index%4}" aria-hidden="true"><span>JM MOTORI / REPAIR RECORD</span><span class="card-cover-number">${pad(index+1)}</span><span class="card-cover-model">${multiline(compactName)}</span><span class="card-fail-note">RSS 대표 사진 불러오는 중</span></div>
      ${photo?`<img src="${escape(photo)}" alt="${escape(post.model)} 정비 기록의 RSS 대표 사진" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:''}
      <span class="card-image-label">JM MOTORI / REPAIR RECORD</span></div>`;
  }
  function postCard(post,index,editorial=null) {
    const title=editorial?.title||post.title;
    const work=editorial?.work||post.work;
    const tags=post.symptoms.slice(0,2).map(id=>`<span>${escape(labels.get(id)||id)}</span>`).join('');
    return `<article class="journal-card" data-record="${escape(post.id)}" data-car-brand="${escape(post.brand)}"><button type="button" class="card-open" data-open="${escape(post.id)}" aria-label="${escape(post.model+', '+title.replaceAll('\n',' ')+' — 정비 기록 미리보기')}">${coverMarkup(post,index)}<div class="card-meta"><span class="car-model">${escape(post.model)}</span><time datetime="${escape(post.date)}">${dateLabel(post.date)}</time></div><h3 class="card-title">${multiline(title)}</h3><p class="card-work">${editorial?'작업 · ':''}${escape(work)}</p></button><div class="card-footer"><div class="card-tags">${tags||'<span>정비 기록</span>'}</div><a class="card-source-link" href="${escape(validPostUrl(post.url))}" target="_blank" rel="noopener noreferrer" aria-label="${escape(post.model)} 네이버 원문 새 창으로 열기">원문 보기 <span aria-hidden="true">↗</span></a></div></article>`;
  }
  function featuredPosts() {
    const chosen=[];
    for(const item of (config.featured||[])){const post=feed.posts.find(p=>p.id===item.id&&p.brand==='MINI');if(post&&!chosen.some(c=>c.post.id===post.id))chosen.push({post,editorial:item});}
    // Keep MINI first even after the feed window changes and curated IDs disappear.
    for(const post of feed.posts){if(chosen.length>=3)break;if(post.brand==='MINI'&&!chosen.some(c=>c.post.id===post.id))chosen.push({post,editorial:null});}
    return chosen.slice(0,3);
  }
  function getMatches() {
    const terms=state.query.toLocaleLowerCase('ko').trim().split(/\s+/).filter(Boolean);
    return feed.posts.filter(post=>{
      const brand=state.brand==='all'||(state.brand==='other'?!['MINI','BMW'].includes(post.brand):post.brand===state.brand);
      const symptom=state.symptom==='all'||post.symptoms.includes(state.symptom);
      const haystack=[post.model,post.brand,post.title,post.originalTitle,post.work,...post.tags].join(' ').toLocaleLowerCase('ko');
      return brand&&symptom&&terms.every(t=>haystack.includes(t));
    });
  }
  function renderArchive() {
    if(!validFeed(feed))return;
    const matches=getMatches();
    const grid=$('#journal-grid');
    grid.classList.toggle('is-list',state.list);
    grid.innerHTML=matches.slice(0,state.limit).map((p,i)=>postCard(p,i)).join('');
    $('#empty-state').hidden=matches.length>0;
    $('#result-count').textContent=`${matches.length}개의 기록`;
    $('#load-more').hidden=state.limit>=matches.length;
    $$('.brand-filters button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.brand===state.brand)));
    $('#symptom-select').value=state.symptom;
    $('#grid-view').setAttribute('aria-pressed',String(!state.list));
    $('#list-view').setAttribute('aria-pressed',String(state.list));
    mediaInit(grid);
  }
  function initializeContent() {
    if(!validFeed(feed)){
      $('#featured-grid').innerHTML='<p>정비 기록을 불러오지 못했습니다. <a href="https://blog.naver.com/ablymotors">네이버 블로그에서 확인해 주세요.</a></p>';
      $('#archive-panel').hidden=true;return;
    }
    labels.clear();feed.filters.forEach(f=>labels.set(f.id,f.label));
    $('#source-record-count').textContent=feed.posts.length;
    for(const kind of ['mini','all','bmw','other']){
      $('#count-'+kind).textContent=feed.posts.filter(p=>kind==='all'||(kind==='other'?!['MINI','BMW'].includes(p.brand):p.brand===kind.toUpperCase())).length;
    }
    $('#symptom-select').innerHTML='<option value="all">모든 증상</option>'+feed.filters.map(f=>`<option value="${escape(f.id)}">${escape(f.label)}</option>`).join('');
    $('#featured-grid').innerHTML=featuredPosts().map((c,i)=>postCard(c.post,i,c.editorial)).join('');
    const snap=feed.meta.snapshotAt.slice(0,10).replaceAll('-','.');
    $('#snapshot-caption').innerHTML=`네이버 블로그 RSS · ${escape(snap)} 수집본<br>원문 제목과 일부 본문은 기록 미리보기에서 확인할 수 있습니다.`;
    renderArchive();mediaInit($('#featured-grid'));
  }
  function openDialog(dialog) {
    lastFocused=document.activeElement;
    dialog.showModal();document.body.classList.add('dialog-open');dialog.scrollTop=0;
    $('.dialog-close',dialog)?.focus();
  }
  function openPost(id) {
    const post=feed?.posts?.find(p=>p.id===id);if(!post)return;
    const editorial=config.featured?.find(c=>c.id===id);
    $('#dialog-body').innerHTML=`<div class="dialog-record-body"><p class="dialog-model">${escape(post.model)} / JM MOTORI</p><h2 id="dialog-title">${multiline(editorial?.title||post.title)}</h2><p class="dialog-work">작업 · ${escape(editorial?.work||post.work)}</p><time datetime="${escape(post.date)}">${dateLabel(post.date)} · NAVER BLOG</time>${coverMarkup(post,feed.posts.indexOf(post),'dialog-photo')}<span class="excerpt-label">블로그 원문 인용 · RSS 미리보기</span><p class="dialog-excerpt">${escape(post.excerpt)}</p><p class="dialog-warning">위 내용은 과거 게시글의 일부를 그대로 인용한 RSS 미리보기입니다. 현재 전문 분야는 ‘MINI 전문 정비’입니다. 전체 작업 과정은 네이버 원문에서 확인해 주세요. 유사한 증상이 같은 원인을 뜻하지는 않습니다.</p><details><summary>원문 제목 확인</summary><p class="dialog-original-title">${escape(post.originalTitle)}</p></details><div class="dialog-actions"><a class="button button-dark" href="${escape(validPostUrl(post.url))}" target="_blank" rel="noopener noreferrer">네이버 전체 기록 <span aria-hidden="true">↗</span></a><a class="button button-orange" href="tel:01041957485">내 차 정비 상담 <span aria-hidden="true">↗</span></a></div></div>`;
    mediaInit($('#dialog-body'));openDialog($('#record-dialog'));
  }
  function closeMenu() {$('#navigation').classList.remove('is-open');$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').setAttribute('aria-label','메뉴 열기');}
  function showToast(message) {clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('is-visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('is-visible'),3600);}
  $('#services-grid').innerHTML=services.map((s,i)=>`<button class="service-card" type="button" data-symptom="${s.id}" aria-label="${s.title}, 관련 MINI 정비 기록 보기"><span class="service-icon" aria-hidden="true"><svg viewBox="0 0 30 30">${s.icon}</svg></span><span class="service-number" aria-hidden="true">${pad(i+1)}</span><h3>${s.title}</h3><p>${multiline(s.description)}</p><span class="service-arrow" aria-hidden="true">↗</span></button>`).join('');
  $('#menu-toggle').addEventListener('click',()=>{const open=$('#menu-toggle').getAttribute('aria-expanded')!=='true';$('#navigation').classList.toggle('is-open',open);$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
  $$('#navigation a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();const open=event.target.closest('[data-open]');if(open)openPost(open.dataset.open);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  $('#services-grid').addEventListener('click',event=>{
    const button=event.target.closest('[data-symptom]');if(!button||!validFeed(feed))return;
    Object.assign(state,{brand:'MINI',symptom:button.dataset.symptom,query:'',limit:pageSize});$('#search').value='';
    $('#archive-panel').open=true;renderArchive();
    requestAnimationFrame(()=>{$('#archive-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});$('#symptom-select').focus({preventScroll:true});});
  });
  $('#archive-panel').addEventListener('toggle',()=>{if($('#archive-panel').open)mediaInit($('#archive-panel'));});
  $('.brand-filters').addEventListener('click',event=>{const button=event.target.closest('[data-brand]');if(!button)return;state.brand=button.dataset.brand;state.limit=pageSize;renderArchive();});
  $('#search').addEventListener('input',event=>{state.query=event.target.value;state.limit=pageSize;renderArchive();});
  $('#symptom-select').addEventListener('change',event=>{state.symptom=event.target.value;state.limit=pageSize;renderArchive();});
  $('#grid-view').addEventListener('click',()=>{state.list=false;renderArchive();});
  $('#list-view').addEventListener('click',()=>{state.list=true;renderArchive();});
  $('#reset-filters').addEventListener('click',()=>{Object.assign(state,{brand:'MINI',symptom:'all',query:'',limit:pageSize});$('#search').value='';renderArchive();$('#search').focus();});
  $('#load-more').addEventListener('click',()=>{const before=state.limit;state.limit+=pageSize;renderArchive();const card=$$('.journal-card',$('#journal-grid'))[before];$('.card-open',card||$('#journal-grid'))?.focus({preventScroll:true});});
  $('#source-button').addEventListener('click',()=>openDialog($('#source-dialog')));
  $('#dialog-close').addEventListener('click',()=>$('#record-dialog').close());
  $('#source-close').addEventListener('click',()=>$('#source-dialog').close());
  $$('dialog').forEach(dialog=>{dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');if(lastFocused?.isConnected)lastFocused.focus({preventScroll:true});});dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});});
  $('#copy-address').addEventListener('click',async()=>{
    const address='광주 광산구 사암로106번길 68, 1층 (우산동 1073-1)';
    try {if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(address);else{const el=document.createElement('textarea');el.value=address;el.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.append(el);el.focus();el.select();const success=document.execCommand('copy');el.remove();if(!success)throw new Error('Clipboard unavailable');}showToast('매장 주소를 복사했습니다.');}catch{showToast(address);}
    $('#copy-address').focus({preventScroll:true});
  });
  // Build-time local images, when present, work without external hotlink requests.
  $$('img[data-asset]').forEach(img=>{const local=validImageUrl(assets[img.dataset.asset]);if(local)img.src=local;});
  initializeContent();mediaInit();
  // Optional refresh preserves a known-good snapshot on all network/schema failures.
  if(window.JM_FEED_ENDPOINT&&location.protocol.startsWith('http')){
    try {const endpoint=new URL(window.JM_FEED_ENDPOINT,location.href);if(endpoint.origin!==location.origin)throw new Error('Same-origin endpoint required');
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);
      fetch(endpoint.href,{signal:controller.signal,headers:{Accept:'application/json'}}).then(res=>{if(!res.ok)throw new Error('Feed unavailable');return res.json();}).then(next=>{if(!validFeed(next))throw new Error('Invalid feed');feed=next;initializeContent();}).catch(()=>{}).finally(()=>clearTimeout(timer));
    }catch{/* Keep the bundled source snapshot. */}
  }
})();
