import * as THREE from 'three';

/* Embalagem kraft de 250 g, montada em código: a forma é uma caixa deformada
   (base reta, corpo cheio, topo selado) e o rótulo é desenhado em canvas
   a partir do logo e dos textos da embalagem real. */

const PAPER = '#C39A6A';
const INK = '#3A2A21';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

/* papel kraft com fibras e pintas */
function paintKraft(ctx, w, h, seed) {
  const r = rng(seed);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#C8A072');
  g.addColorStop(0.5, PAPER);
  g.addColorStop(1, '#B98F5F');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const n = Math.round((w * h) / 140);
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h;
    const len = 6 + r() * 34;
    const ang = (r() - 0.5) * 0.9 + (r() < 0.25 ? Math.PI / 2 : 0);
    ctx.strokeStyle = r() < 0.5 ? 'rgba(255,238,205,0.08)' : 'rgba(70,40,15,0.07)';
    ctx.lineWidth = 0.6 + r() * 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  for (let i = 0; i < n / 8; i++) {
    ctx.fillStyle = `rgba(60,34,12,${0.05 + r() * 0.12})`;
    ctx.beginPath();
    ctx.arc(r() * w, r() * h, 0.6 + r() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* selagem do topo: faixa dobrada com ranhuras */
function paintSeal(ctx, w, h) {
  const sealH = h * 0.072;
  const g = ctx.createLinearGradient(0, 0, 0, sealH);
  g.addColorStop(0, 'rgba(60,35,12,0.22)');
  g.addColorStop(1, 'rgba(60,35,12,0.06)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, sealH);
  ctx.fillStyle = 'rgba(50,28,8,0.16)';
  for (let y = sealH * 0.12; y < sealH * 0.9; y += 15) ctx.fillRect(0, y, w, 3);
  ctx.fillStyle = 'rgba(255,236,200,0.28)';
  ctx.fillRect(0, sealH, w, 3);
  ctx.fillStyle = 'rgba(50,28,8,0.22)';
  ctx.fillRect(0, sealH + 3, w, 5);
}

function bumpFor(w, h, seed) {
  const c = canvas(w, h);
  const x = c.getContext('2d');
  x.fillStyle = '#808080';
  x.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < (w * h) / 220; i++) {
    const px = r() * w, py = r() * h, len = 5 + r() * 26, a = (r() - 0.5) * 0.9;
    x.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
    x.lineWidth = 0.8 + r();
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke();
  }
  const sealH = h * 0.072;
  x.fillStyle = '#ffffff';
  for (let y = sealH * 0.12; y < sealH * 0.9; y += 15) x.fillRect(0, y, w, 6);
  x.fillStyle = '#000000';
  x.fillRect(0, sealH + 3, w, 6);
  return c;
}

function beans(ctx, x, y, w, h, seed) {
  const r = rng(seed);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#F4F2EF';
  ctx.fillRect(x, y, w, h);
  const step = 62;
  for (let j = 0; j * step < h + step; j++) {
    for (let i = 0; i * step < w + step; i++) {
      const bx = x + i * step + (j % 2 ? step / 2 : 0) + (r() - 0.5) * 16;
      const by = y + j * step + (r() - 0.5) * 16;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(r() * Math.PI);
      ctx.fillStyle = 'rgba(160,150,158,0.30)';
      ctx.beginPath(); ctx.ellipse(0, 0, 17, 10.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(244,242,239,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(0, 5, 14, 0); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

function paintFront(logo) {
  const W = 1200, H = 2040;
  const c = canvas(W, H);
  const ctx = c.getContext('2d');
  paintKraft(ctx, W, H, 11);

  // rótulo
  const lx = Math.round(W * 0.131), lw = Math.round(W * 0.709);
  const ly = Math.round(H * 0.445), lh = Math.round(H * 0.459);
  ctx.save();
  ctx.shadowColor = 'rgba(40,22,6,0.28)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#F4F2EF';
  ctx.fillRect(lx, ly, lw, lh);
  ctx.restore();
  beans(ctx, lx, ly, lw, lh, 5);

  // logo (tinta escura sobre branco)
  const ls = lw * 0.66;
  ctx.drawImage(logo, lx + (lw - ls) / 2, ly + lh * 0.03, ls, ls * (logo.height / logo.width));

  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  const baseY = ly + lh * 0.755;
  ctx.font = '600 56px "Bricolage Grotesque"';
  ctx.textAlign = 'left';
  ctx.fillText('100% ARÁBICA', lx + lw * 0.07, baseY);
  ctx.fillRect(lx + lw * 0.50, baseY - 60, 3, 100);
  ctx.font = '500 36px "Bricolage Grotesque"';
  ctx.textAlign = 'center';
  ctx.fillText('CAFÉ TORRADO', lx + lw * 0.76, baseY - 16);
  ctx.fillText('EM GRÃOS', lx + lw * 0.76, baseY + 26);
  ctx.font = '600 50px "Bricolage Grotesque"';
  ctx.fillText('250g', lx + lw * 0.76, baseY + 92);

  ctx.textAlign = 'left';
  ctx.font = '500 38px "Bricolage Grotesque"';
  ctx.fillText('(61) 9 9294 7316', lx + lw * 0.07, baseY + 92);

  // faixa inferior
  const bh = lh * 0.078;
  ctx.fillStyle = '#5C4B3F';
  ctx.fillRect(lx, ly + lh - bh, lw, bh);
  ctx.fillStyle = '#EFE8DE';
  ctx.font = '500 34px "Bricolage Grotesque"';
  ctx.textAlign = 'left';
  ctx.fillText('Sul de Minas', lx + lw * 0.07, ly + lh - bh * 0.34);
  ctx.textAlign = 'right';
  ctx.fillText('Ibiraci - MG', lx + lw * 0.93, ly + lh - bh * 0.34);
  ctx.save();
  ctx.translate(lx + lw / 2, ly + lh - bh / 2);
  ctx.strokeStyle = '#EFE8DE'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 13, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(0, 8, 18, 0); ctx.stroke();
  ctx.restore();

  // válvula de gás
  const vx = W / 2, vy = H * 0.292;
  ctx.fillStyle = 'rgba(60,35,12,0.35)';
  ctx.beginPath(); ctx.arc(vx, vy, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2A1A10';
  ctx.beginPath(); ctx.arc(vx, vy, 7, 0, Math.PI * 2); ctx.fill();

  paintSeal(ctx, W, H);
  return { map: c, bump: bumpFor(W, H, 21) };
}

function paintBack(logo) {
  const W = 1200, H = 2040;
  const c = canvas(W, H);
  const ctx = c.getContext('2d');
  paintKraft(ctx, W, H, 33);
  ctx.globalCompositeOperation = 'multiply';
  const ls = W * 0.62;
  ctx.drawImage(logo, (W - ls) / 2, H * 0.30, ls, ls * (logo.height / logo.width));
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = '600 54px "Bricolage Grotesque"';
  ctx.fillText('100% arábica', W / 2, H * 0.64);
  ctx.font = '500 42px "Bricolage Grotesque"';
  ctx.fillText('Café torrado em grãos', W / 2, H * 0.64 + 66);
  ctx.fillText('Sul de Minas, Ibiraci - MG', W / 2, H * 0.64 + 126);
  ctx.font = '500 40px "Bricolage Grotesque"';
  ctx.fillText('@cafefazendaguanabaraa', W / 2, H * 0.84);
  ctx.fillText('(61) 99294-7316', W / 2, H * 0.84 + 58);
  paintSeal(ctx, W, H);
  return { map: c, bump: bumpFor(W, H, 44) };
}

function sideTexture() {
  const c = canvas(1024, 1024);
  paintKraft(c.getContext('2d'), 1024, 1024, 77);
  return c;
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function buildGeometry() {
  const w = 1.0, h = 1.7, d = 0.58;
  const geo = new THREE.BoxGeometry(w, h, d, 32, 130, 14);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = (y + h / 2) / h;
    const nx = x / (w / 2);
    // profundidade: cheia no corpo, achatada na selagem
    const ds = 1 - 0.96 * smooth(0.74, 0.93, t);
    // abaulado do corpo e laterais recolhidas
    const edge = 1 - 0.42 * Math.pow(Math.abs(nx), 2.2);
    const base = 0.86 + 0.14 * smooth(0, 0.12, t);
    let zz = z * ds * edge * base;
    // pequenas rugas no papel
    if (Math.abs(z) > d * 0.45) {
      const s = Math.sign(z);
      const wr = Math.sin(x * 17.3 + y * 5.1) * Math.sin(y * 11.7 - x * 3.3) + 0.5 * Math.sin(x * 33 + y * 21);
      zz += s * ds * 0.0065 * wr * smooth(0.04, 0.2, t);
    }
    x *= 1 - 0.07 * smooth(0.7, 1, t);
    p.setXYZ(i, x, y, zz);
  }
  geo.computeVertexNormals();
  return geo;
}

export async function createBag(canvasEl, container, { reduceMotion = false } = {}) {
  await Promise.all([
    document.fonts.load('600 56px "Bricolage Grotesque"'),
    document.fonts.load('500 36px "Bricolage Grotesque"'),
  ]);
  const logo = await loadImage('assets/img/logo-tinta.png');

  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const tex = (cv, srgb = true) => {
    const t = new THREE.CanvasTexture(cv);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    return t;
  };

  const front = paintFront(logo);
  const back = paintBack(logo);
  const sideMap = tex(sideTexture());
  const sideMat = new THREE.MeshStandardMaterial({ map: sideMap, roughness: 0.9, metalness: 0 });
  const frontMat = new THREE.MeshStandardMaterial({ map: tex(front.map), bumpMap: tex(front.bump, false), bumpScale: 2.2, roughness: 0.86, metalness: 0 });
  const backMat = new THREE.MeshStandardMaterial({ map: tex(back.map), bumpMap: tex(back.bump, false), bumpScale: 2.2, roughness: 0.86, metalness: 0 });
  // ordem das faces da caixa: +x, -x, +y, -y, +z, -z
  const bag = new THREE.Mesh(buildGeometry(), [sideMat, sideMat, sideMat, sideMat, frontMat, backMat]);

  const pivot = new THREE.Group();
  pivot.add(bag);

  const scene = new THREE.Scene();
  scene.add(pivot);

  // sombra de contato
  const sh = canvas(256, 256);
  const sx = sh.getContext('2d');
  const gr = sx.createRadialGradient(128, 128, 8, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = gr; sx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 1.5),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.86;
  scene.add(shadow);

  scene.add(new THREE.HemisphereLight(0xfff0dc, 0x2a1d16, 1.05));
  const key = new THREE.DirectionalLight(0xffe4c4, 2.3); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fd8b6, 1.3); rim.position.set(-4, 2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45); fill.position.set(-3, -1, 4); scene.add(fill);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const distH = 1.98 / (2 * tan);   // a embalagem ocupa ~86% da altura
    const distW = 1.7 / (2 * tan * camera.aspect); // largura nunca fica cortada
    camera.position.set(0, 0.12, Math.max(distH, distW));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    dirty = true;
  };
  let dirty = true;
  new ResizeObserver(resize).observe(container);

  /* ---- interação ---- */
  let rotY = -0.45, rotX = 0.04, vel = 0, dragging = false, lastX = 0, lastY = 0, idleSince = performance.now();
  let snap = null;
  const faceBtns = [...container.querySelectorAll('[data-face]')];
  let face = 'front';
  const touch = () => { container.classList.add('is-touched'); idleSince = performance.now(); };

  canvasEl.addEventListener('pointerdown', (e) => {
    dragging = true; snap = null; vel = 0;
    lastX = e.clientX; lastY = e.clientY;
    canvasEl.setPointerCapture(e.pointerId);
    touch();
  });
  canvasEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    rotY += dx * 0.011;
    vel = dx * 0.011;
    rotX = Math.max(-0.3, Math.min(0.3, rotX + dy * 0.004));
    dirty = true; touch();
  });
  const end = () => { dragging = false; idleSince = performance.now(); };
  canvasEl.addEventListener('pointerup', end);
  canvasEl.addEventListener('pointercancel', end);

  canvasEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { snap = rotY - 0.6; e.preventDefault(); touch(); }
    if (e.key === 'ArrowRight') { snap = rotY + 0.6; e.preventDefault(); touch(); }
  });

  faceBtns.forEach((b) => b.addEventListener('click', () => {
    const target = b.dataset.face === 'front' ? 0 : Math.PI;
    snap = target + Math.PI * 2 * Math.round((rotY - target) / (Math.PI * 2));
    touch();
  }));

  /* ---- laço de render (só quando visível) ---- */
  let visible = true, raf = 0;
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (snap !== null) {
      rotY += (snap - rotY) * 0.1;
      rotX += (0.04 - rotX) * 0.1;
      vel = 0; dirty = true;
      if (Math.abs(snap - rotY) < 0.002) { rotY = snap; snap = null; idleSince = now; }
    } else if (!dragging) {
      if (Math.abs(vel) > 0.0004) { rotY += vel; vel *= 0.93; dirty = true; }
      else if (!reduceMotion && now - idleSince > 2200) { rotY += 0.0035; dirty = true; }
    }
    const f = Math.cos(rotY) >= 0 ? 'front' : 'back';
    if (f !== face) {
      face = f;
      faceBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.face === f)));
    }
    if (!dirty) return;
    dirty = false;
    pivot.rotation.set(rotX, rotY, 0);
    shadow.material.opacity = 1;
    renderer.render(scene, camera);
  };
  const io = new IntersectionObserver((en) => {
    visible = en[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
  });
  io.observe(container);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
    else if (!document.hidden && visible && !raf) raf = requestAnimationFrame(tick);
  });

  resize();
  raf = requestAnimationFrame(tick);
}
