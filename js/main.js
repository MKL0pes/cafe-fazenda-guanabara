const WA_NUMBER = '5561992947316';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

/* ---------- Links do WhatsApp com mensagem pronta ---------- */
$$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); });
$('#year').textContent = new Date().getFullYear();

/* ---------- Entrada (uma única sequência) ---------- */
const ready = () => document.documentElement.classList.add('is-ready');
const heroImg = $('.hero__cup img');
Promise.race([
  Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve()]),
  new Promise((r) => setTimeout(r, 1800)),
]).then(() => requestAnimationFrame(ready));

/* ---------- Cabeçalho ---------- */
const top = $('.top');
let lastY = window.scrollY;
const onScrollHeader = () => {
  const y = window.scrollY;
  top.classList.toggle('is-solid', y > 40);
  const menuOpen = $('#menu').classList.contains('is-open');
  top.classList.toggle('is-hidden', y > lastY && y > 480 && !menuOpen);
  lastY = y;
};

const menuBtn = $('.menu-btn');
const menu = $('#menu');
const setMenu = (open) => {
  menu.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Fechar' : 'Menu';
};
menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Hero: leve inclinação com o ponteiro ---------- */
const tilt = $('[data-tilt]');
if (tilt && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    tilt.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0)`;
  }, { passive: true });
}

/* ---------- Jornada: etapas guiadas pela rolagem ---------- */
const journey = $('.journey');
const steps = $$('.step', journey);
const frames = $$('.frame img', journey);
const rail = $$('.journey__rail li', journey);
const bar = $('.frame__bar span', journey);
let stageNow = -1;

const setStage = (i) => {
  if (i === stageNow) return;
  stageNow = i;
  steps.forEach((el, k) => el.classList.toggle('is-active', k === i));
  frames.forEach((el, k) => el.classList.toggle('is-active', k === i));
  rail.forEach((el, k) => el.classList.toggle('is-active', k === i));
};

const onScrollJourney = () => {
  const r = journey.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / total));
  const i = Math.min(steps.length - 1, Math.floor(p * steps.length));
  setStage(i);
  bar.parentElement.style.setProperty('--p', p.toFixed(3));
  bar.style.setProperty('--p', p.toFixed(3));
};

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    onScrollHeader();
    onScrollJourney();
    ticking = false;
  });
}, { passive: true });
window.addEventListener('resize', onScrollJourney);
onScrollHeader();
onScrollJourney();

/* ---------- Embalagem: pedido pelo WhatsApp ---------- */
const qty = $('#qty');
const orderLink = $('#order-link');
const clampQty = () => {
  const n = Math.min(20, Math.max(1, parseInt(qty.value, 10) || 1));
  qty.value = n;
  return n;
};
const updateOrder = () => {
  const n = clampQty();
  const txt = `Olá! Quero pedir ${n} ${n === 1 ? 'pacote' : 'pacotes'} do Café Fazenda Guanabara (250 g, torrado em grãos). Como faço?`;
  orderLink.href = waLink(txt);
};
$$('.stepper [data-step]').forEach((b) => b.addEventListener('click', () => {
  qty.value = (parseInt(qty.value, 10) || 1) + Number(b.dataset.step);
  updateOrder();
}));
qty.addEventListener('input', updateOrder);
qty.addEventListener('change', updateOrder);
updateOrder();

/* ---------- Embalagem 3D (carrega quando a seção chega perto) ---------- */
const viewer = $('#viewer');
const showFallback = () => {
  $('#bag').hidden = true;
  $('.pack__fallback').hidden = false;
  $('.pack__tools').hidden = true;
  $('.pack__hint').hidden = true;
};
const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
})();

if (!hasWebGL) {
  showFallback();
} else {
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    import('./bag3d.js')
      .then((m) => m.createBag($('#bag'), viewer, { reduceMotion }))
      .catch((err) => { console.error('Embalagem 3D indisponível', err); showFallback(); });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { load(); io.disconnect(); }
    }, { rootMargin: '600px 0px' });
    io.observe(viewer);
  } else {
    load();
  }
}

/* ---------- Guia de preparo ---------- */
const METHODS = {
  coado: { ratio: 16, grind: 'Média', time: '2:30 a 3:30', temp: '92 a 96 °C', tip: 'Molhe o filtro e deixe o pó florar por 30 segundos antes de seguir com a água.' },
  prensa: { ratio: 15, grind: 'Grossa', time: '4 min', temp: '92 a 96 °C', tip: 'Empurre o êmbolo devagar e sirva logo, para o café não passar do ponto.' },
  moka: { ratio: 10, grind: 'Média a fina', time: 'Até o café subir', temp: 'Água já quente no fundo', tip: 'Não pressione o pó e use fogo baixo. Retire quando o café parar de subir.' },
};
const water = $('#water');
const fmtSpoons = (g) => {
  const s = Math.round((g / 6) * 2) / 2;
  return String(s).replace('.', ',');
};
const renderBrew = () => {
  const m = METHODS[$('input[name="method"]:checked').value];
  const ml = Number(water.value);
  const g = Math.round(ml / m.ratio);
  $('#water-out').textContent = `${ml} ml`;
  $('#out-coffee').textContent = `${g} g (cerca de ${fmtSpoons(g)} colheres de sopa)`;
  $('#out-grind').textContent = m.grind;
  $('#out-time').textContent = m.time;
  $('#out-temp').textContent = m.temp;
  $('#out-tip').textContent = m.tip;
  // xícara: o nível acompanha a água (de 150 a 1000 ml)
  const level = (ml - 150) / 850;
  $('#cup-fill').setAttribute('y', String(118 - level * 66));
};
$$('input[name="method"]').forEach((r) => r.addEventListener('change', renderBrew));
water.addEventListener('input', renderBrew);
renderBrew();
