// Font Multiserveis: cabecera, menú, puntos de la portada, regla de altura, comparador, visor, carrusel de ideas, mapa y formulario a WhatsApp
(() => {
  const D = document, R = D.documentElement;
  R.classList.add('js');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { dims, pre } = window.FONT || { dims: {}, pre: '' };

  // cabecera sólida al bajar
  const cab = D.getElementById('cab');
  const solida = () => cab.classList.toggle('solida', scrollY > 30);
  solida(); addEventListener('scroll', solida, { passive: true });

  // menú móvil
  const burger = D.querySelector('.cab__burger'), menu = D.getElementById('menu');
  const cierra = () => { menu.classList.remove('abierto'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', burger.dataset.abrir); R.style.overflow = ''; };
  burger.addEventListener('click', () => {
    const abre = !menu.classList.contains('abierto');
    menu.classList.toggle('abierto', abre); burger.setAttribute('aria-expanded', String(abre));
    burger.setAttribute('aria-label', abre ? burger.dataset.cerrar : burger.dataset.abrir); R.style.overflow = abre ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', cierra));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('abierto')) { cierra(); burger.focus(); } });

  // luz que sigue al cursor sobre los puntos de la portada
  const hero = D.querySelector('.hero');
  if (hero && matchMedia('(hover: hover)').matches && !reducido) {
    let raf = 0, x = 0, y = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect(); x = e.clientX - r.left; y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(() => { hero.style.setProperty('--mx', x + 'px'); hero.style.setProperty('--my', y + 'px'); raf = 0; });
    });
  }

  // aparición al entrar en pantalla
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  D.querySelectorAll('.aparece').forEach((el) => io.observe(el));

  // regla de metros en «trabajos en altura»
  const alt = D.querySelector('.altura'), marca = D.querySelector('.altura__marca');
  if (alt && marca) {
    const num = marca.querySelector('b'); let vis = false, raf2 = 0;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(alt);
    const mueve = () => {
      raf2 = 0; if (!vis) return;
      const r = alt.getBoundingClientRect(), h = r.height;
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + h)));
      marca.style.setProperty('--y', (40 + p * (h - 80)) + 'px');
      num.textContent = Math.round(p * 30);
    };
    addEventListener('scroll', () => { if (!raf2) raf2 = requestAnimationFrame(mueve); }, { passive: true }); mueve();
  }

  // comparador antes / después
  D.querySelectorAll('.comp').forEach((c) => {
    const marco = c.querySelector('.comp__marco'), rango = c.querySelector('.comp__rango');
    const pon = (v) => marco.style.setProperty('--p', v + '%');
    rango.addEventListener('input', () => pon(rango.value));
    // arrastre directo (el input cubre el marco; en táctil solo arrastre horizontal)
    let activo = false;
    const desde = (e) => { const r = marco.getBoundingClientRect(); const v = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)); rango.value = v; pon(v); };
    marco.addEventListener('pointerdown', (e) => { activo = true; desde(e); });
    marco.addEventListener('pointermove', (e) => { if (activo) desde(e); });
    addEventListener('pointerup', () => { activo = false; });
    // pequeño gesto al aparecer para que se entienda
    if (!reducido) new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      let t0 = 0; const anim = (t) => { if (!t0) t0 = t; const k = Math.min(1, (t - t0) / 1600); const v = 50 + Math.sin(k * Math.PI * 2) * 14 * (1 - k); pon(v); rango.value = v; if (k < 1) requestAnimationFrame(anim); };
      requestAnimationFrame(anim);
    }, { threshold: .6 }).observe(marco);
  });
  const pest = [...D.querySelectorAll('.pest')];
  pest.forEach((b) => b.addEventListener('click', () => {
    pest.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    D.querySelectorAll('.comp').forEach((c) => { const on = c.dataset.par === b.dataset.par; c.hidden = !on; c.classList.toggle('activo', on); });
    b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducido ? 'auto' : 'smooth' });
  }));

  // visor de fotos (ideas y más trabajos)
  const visor = D.getElementById('visor'), vImg = visor.querySelector('img'), vCap = visor.querySelector('figcaption');
  const vAnt = visor.querySelector('.visor__ant'), vSig = visor.querySelector('.visor__sig');
  let lista = [], titulos = [], idx = 0, origen = null;
  const src = (id, w) => { const d = dims[id]; const a = d[2].filter((x) => x <= Math.max(w, d[2][0])).pop() || d[2][0]; return `${pre}img/${id}-${a}.webp`; };
  const muestra = () => {
    const id = lista[idx], d = dims[id]; const w = Math.min(innerWidth * devicePixelRatio, 1600);
    vImg.src = src(id, w); vImg.width = d[0]; vImg.height = d[1]; vImg.alt = titulos[idx] || '';
    vCap.textContent = titulos[idx] || '';
    vAnt.hidden = vSig.hidden = lista.length < 2;
  };
  D.querySelectorAll('[data-visor]').forEach((b) => b.addEventListener('click', () => {
    lista = b.dataset.visor.split(',');
    const tit = b.dataset.titulo, tits = b.dataset.titulos;
    if (tits) titulos = tits.split('|');
    else { const ad = D.querySelectorAll('.comp__tag'); const a = ad[0] ? ad[0].textContent : '', d = ad[1] ? ad[1].textContent : ''; titulos = lista.length === 2 ? [`${tit} · ${a}`, `${tit} · ${d}`] : [tit]; }
    idx = +(b.dataset.i || 0); origen = b; muestra(); visor.showModal();
  }));
  const paso = (n) => { idx = (idx + n + lista.length) % lista.length; muestra(); };
  vAnt.addEventListener('click', () => paso(-1)); vSig.addEventListener('click', () => paso(1));
  visor.querySelector('.visor__x').addEventListener('click', () => visor.close());
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
  visor.addEventListener('close', () => { vImg.removeAttribute('src'); if (origen) origen.focus(); });
  visor.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') paso(-1); if (e.key === 'ArrowRight') paso(1); });
  let tx = 0; visor.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) paso(dx < 0 ? 1 : -1); });

  // flechas del carrusel de ideas
  const ideas = D.querySelector('.ideas');
  D.querySelectorAll('[data-mueve]').forEach((b) => b.addEventListener('click', () => {
    const li = ideas.querySelector('.idea'); const w = li ? li.getBoundingClientRect().width + 16 : 320;
    ideas.scrollBy({ left: +b.dataset.mueve * w * 2, behavior: reducido ? 'auto' : 'smooth' });
  }));

  // mapa: se carga al acercarse (no frena la portada)
  const mapa = D.querySelector('.mapa');
  if (mapa) new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    const f = D.createElement('iframe'); f.src = mapa.dataset.src; f.loading = 'lazy'; f.title = 'Google Maps · Font Multiserveis'; f.referrerPolicy = 'no-referrer-when-downgrade';
    mapa.prepend(f);
  }, { rootMargin: '400px' }).observe(mapa);

  // formulario → WhatsApp
  const form = D.getElementById('form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form); let ok = true;
    ['nombre', 'msg'].forEach((n) => { const el = form.elements[n]; const mal = !String(f.get(n) || '').trim(); el.classList.toggle('error', mal); if (mal && ok) { el.focus(); ok = false; } });
    if (!ok) return;
    const etq = (n) => form.elements[n].closest('label').querySelector('span').textContent;
    const lineas = [form.dataset.inicio, '', `${etq('nombre')}: ${f.get('nombre')}`];
    ['tel', 'pueblo', 'servicio'].forEach((n) => { const v = String(f.get(n) || '').trim(); if (v) lineas.push(`${etq(n)}: ${v}`); });
    lineas.push('', String(f.get('msg')).trim());
    open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank', 'noopener');
  });
})();
