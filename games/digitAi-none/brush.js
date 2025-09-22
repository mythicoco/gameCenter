const board = document.querySelector('.board')
board.innerHTML = Array(28**2).fill(undefined).map((_,i) => `<div class="c${i} cube"></div>`).join("")
let mousedown = false
document.querySelectorAll('.cube').forEach(cube => {
    cube.addEventListener('mousedown', (e) => {
        e.preventDefault()
        mousedown = true;
        draw(cube, e)
    })

    cube.addEventListener('mousemove', (e) => {
        if (mousedown) draw(cube, e);
    })

    cube.addEventListener('mouseenter', (e) => {
        if (mousedown) draw(cube, e)
    })
})

window.addEventListener('mouseup', () => {mousedown = false})

board.addEventListener('touchstart', (e) => {
    mousedown = true;
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    if (el && el.classList.contains('cube')) draw(el, {clientX: t.clientX, clientY: t.clientY});
}, { passive: true });

board.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    if (el && el.classList.contains('cube')) draw(el, {clientX: t.clientX, clientY: t.clientY});
}, { passive: true });

board.addEventListener('touchend', () => { mousedown = false; }, { passive: true });

const BRUSH_SIZE = 3;
const BRUSH_SIGMA_X = 0.6;
const BRUSH_SIGMA_Y = 0.7;
const BRUSH_MIN = 0.0;
function makeAnisoBrush(size, sx, sy) {
  const half = Math.floor(size / 2);
  const arr = new Array(size * size);
  let max = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const dx = j - half;
      const dy = i - half;
      const g = Math.exp(-((dx*dx)/(2*sx*sx) + (dy*dy)/(2*sy*sy)));
      arr[i * size + j] = g;
      if (g > max) max = g;
    }
  }
  for (let k = 0; k < arr.length; k++) {
    arr[k] = arr[k] / max;
    if (arr[k] < BRUSH_MIN) arr[k] = 0;
  }
  return arr;
}
const SOFT_BRUSH = makeAnisoBrush(BRUSH_SIZE, BRUSH_SIGMA_X, BRUSH_SIGMA_Y);
function rgbToGray(el) {
  const s = getComputedStyle(el).backgroundColor;
  const m = s && s.match(/\d+/g);
  if (!m) return 255;
  const g = Number(m[1]);
  return isNaN(g) ? 255 : g;
}

function grayToValue(gray) { return 1 - (gray / 255); }
function valueToGray(v) { return Math.max(0, Math.min(255, Math.round(255 * (1 - v)))); }


function paintSoftAt(r, c) {
  const SIZE = 28;
  const HALF = Math.floor(BRUSH_SIZE / 2);
  for (let i = 0; i < BRUSH_SIZE; i++) {
    for (let j = 0; j < BRUSH_SIZE; j++) {
      const vAdd = SOFT_BRUSH[i * BRUSH_SIZE + j];
      if (vAdd <= 0) continue;
      const rr = r + (i - HALF);
      const cc = c + (j - HALF);
      if (rr < 0 || rr >= SIZE || cc < 0 || cc >= SIZE) continue;
      const idx = rr * SIZE + cc;
      const el = document.querySelector(`.c${idx}`);
      if (!el) continue;
      const gray = rgbToGray(el);
      const vCur = grayToValue(gray);
      const vNew = Math.max(vCur, vAdd);
      const gNew = valueToGray(vNew);
      el.style.backgroundColor = `rgb(${gNew}, ${gNew}, ${gNew})`;
    }
  }
}

function draw(cube, e) {
    const SIZE = 28;
    const classNum = Number(cube.classList[0].match(/\d+/)[0]);
    const r = Math.floor(classNum / SIZE);
    const c = classNum % SIZE;
    paintSoftAt(r, c);
    if (e) {
      const rect = cube.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = Math.max(1, Math.floor(rect.width * 0.18));
      if (x <= t && c - 1 >= 0) paintSoftAt(r, c - 1);
      if (x >= rect.width - t && c + 1 < SIZE) paintSoftAt(r, c + 1);
      if (y <= t && r - 1 >= 0) paintSoftAt(r - 1, c);
      if (y >= rect.height - t && r + 1 < SIZE) paintSoftAt(r + 1, c);
      if (x <= t && y <= t && r - 1 >= 0 && c - 1 >= 0) paintSoftAt(r - 1, c - 1);
      if (x <= t && y >= rect.height - t && r + 1 < SIZE && c - 1 >= 0) paintSoftAt(r + 1, c - 1);
      if (x >= rect.width - t && y <= t && r - 1 >= 0 && c + 1 < SIZE) paintSoftAt(r - 1, c + 1);
      if (x >= rect.width - t && y >= rect.height - t && r + 1 < SIZE && c + 1 < SIZE) paintSoftAt(r + 1, c + 1);
    }
}
