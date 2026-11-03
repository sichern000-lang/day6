import * as THREE from 'three'
import mask from '../data/jeju-mask.json'
import { project } from './stories'
import { rng } from './rng'

// 3D 제주 섬의 땅 — 지도 SVG에서 뽑은 섬 모양(jeju-mask.json) 위에 한라산·오름을 올려 낮은 폴리곤으로 만든다.
// 좌표는 Story Map 과 같은 "지도 좌표(800 폭)"를 쓰고, 화면에는 x-400, y-200 으로 가운데에 놓음. (북쪽이 -z)
export const BG = '#eef2ec'
export const toWorld = (x, y) => ({ x: x - 400, z: y - 200 })

const CELL = mask.scale * (800 / mask.srcW)        // 마스크 한 칸 = 지도 좌표 1.8
const W = mask.w, H = mask.h
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

// ── 바다까지의 거리(부호 있는 거리: 땅은 +, 바다는 -) ──
let sdf
function chamfer(d) {
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 1e6 : d[y * W + x])
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    d[y * W + x] = Math.min(d[y * W + x], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414)
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
    d[y * W + x] = Math.min(d[y * W + x], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414)
  }
}
function boxBlur(a, r) {
  const t = new Float32Array(a.length)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0
    for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < W) { s += a[y * W + xx]; n++ } }
    t[y * W + x] = s / n
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0
    for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < H) { s += t[yy * W + x]; n++ } }
    a[y * W + x] = s / n
  }
}
function buildSdf() {
  const land = new Uint8Array(W * H)
  mask.rows.forEach((runs, y) => {
    let x = 0, v = 0
    for (const n of runs) { if (v) land.fill(1, y * W + x, y * W + x + n); x += n; v ^= 1 }
  })
  const toSea = new Float32Array(W * H), toLand = new Float32Array(W * H)
  for (let i = 0; i < land.length; i++) { toSea[i] = land[i] ? 1e6 : 0; toLand[i] = land[i] ? 0 : 1e6 }
  chamfer(toSea); chamfer(toLand)
  const d = new Float32Array(W * H)
  for (let i = 0; i < d.length; i++) d[i] = (land[i] ? toSea[i] - 0.5 : -(toLand[i] - 0.5)) * CELL
  boxBlur(d, 2); boxBlur(d, 2)
  return d
}
export function groundDistance(x, y) { return distance(x, y) }
function distance(x, y) {                          // 지도 좌표 (x, y) 에서 해안까지의 부호 있는 거리 (이중 선형 보간)
  sdf ||= buildSdf()
  const gx = x / CELL, gy = y / CELL
  const out = Math.max(0, -gx, gx - (W - 1), -gy, gy - (H - 1)) * CELL
  const cx = Math.min(W - 1.001, Math.max(0, gx)), cy = Math.min(H - 1.001, Math.max(0, gy))
  const x0 = Math.floor(cx), y0 = Math.floor(cy), fx = cx - x0, fy = cy - y0
  const v = (xx, yy) => sdf[yy * W + xx]
  const d = v(x0, y0) * (1 - fx) * (1 - fy) + v(x0 + 1, y0) * fx * (1 - fy) + v(x0, y0 + 1) * (1 - fx) * fy + v(x0 + 1, y0 + 1) * fx * fy
  return d - out
}

// ── 값 잡음 (오름과 땅결에 자연스러운 흔들림) ──
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy)
  return (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v) + (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v
}
const fbm = (x, y) => vnoise(x / 55, y / 55) * 0.6 + vnoise(x / 24, y / 24) * 0.3 + vnoise(x / 11, y / 11) * 0.1

const HAL = project(33.3617, 126.5292)            // 한라산 (백록담)
const OREUM = (() => {                              // 한라산 둘레에 흩어진 작은 오름들 (같은 시드라 늘 같은 모양)
  const r = rng('jeju-oreum'), list = []
  for (let i = 0; i < 700 && list.length < 120; i++) {
    const x = 30 + r() * 735, y = 40 + r() * 330
    const rr = Math.hypot(x - HAL.x, y - HAL.y)
    if (distance(x, y) < 26 || rr < 60) continue
    if (r() > 0.3 + 0.7 * Math.exp(-((rr / 240) ** 2))) continue
    list.push({ x, y, a: 3 + r() * 7, r: 9 + r() * 9 })
  }
  return list
})()

export function heightAt(x, y) {
  const d = distance(x, y)
  if (d <= 0) return Math.max(-18, d * 0.14 - 0.2 + (fbm(x + 90, y + 40) - 0.5) * 0.8)      // 바다 밑
  const L = smooth(0, 26, d)
  let h = 0.7 * (1 - Math.exp(-d / 7)) + 5.5 * smooth(0, 70, d)                             // 바닷가에서 완만히 올라옴
  const dx = x - HAL.x, dy = (y - HAL.y) * 1.15
  const r = Math.hypot(dx, dy)
  h += L * (Math.pow(Math.max(0, 1 - r / 270), 1.9) * 58 + 16 * Math.exp(-((r / 52) ** 2)) - 6.5 * Math.exp(-((r / 8.5) ** 2)))   // 한라산 + 백록담
  for (const o of OREUM) {
    const rr = Math.hypot(x - o.x, y - o.y) / o.r
    if (rr < 1) h += L * o.a * Math.pow(1 - rr, 1.5)
  }
  return h + L * (fbm(x, y) - 0.5) * 4.4
}

// 높이 → 색 (사이트의 세이지 톤: 해안은 옅게, 산으로 갈수록 짙게, 정상은 옅은 안개색)
const STOPS = [[-18, '#a9c3d4'], [-4, '#bfd5e2'], [0.2, '#d4e4ec'], [1.1, '#dde6d3'], [4, '#c3d3b2'], [15, '#a4bd94'], [32, '#84a378'], [48, '#6a8963'], [62, '#9fb09a'], [74, '#e2e9de']].map(([h, c]) => [h, new THREE.Color(c)])
const tmp = new THREE.Color()
export function colorAt(h, out = new THREE.Color()) {
  if (h <= STOPS[0][0]) return out.copy(STOPS[0][1])
  for (let i = 1; i < STOPS.length; i++) {
    if (h <= STOPS[i][0]) return out.lerpColors(STOPS[i - 1][1], STOPS[i][1], (h - STOPS[i - 1][0]) / (STOPS[i][0] - STOPS[i - 1][0]))
  }
  return out.copy(STOPS[STOPS.length - 1][1])
}

// 낮은 폴리곤 땅 메시: 격자 꼭짓점을 살짝 흔들고, 삼각형마다 한 가지 색(평평하게 칠함)
export function buildTerrainGeometry() {
  const R = rng('jeju-terrain'), STEP = 8
  const X0 = -90, X1 = 890, Y0 = -100, Y1 = 500
  const cols = Math.ceil((X1 - X0) / STEP), rows = Math.ceil((Y1 - Y0) / STEP)
  const P = []
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const edge = i === 0 || j === 0 || i === cols || j === rows
      const x = X0 + i * STEP + (edge ? 0 : (R() - 0.5) * STEP * 0.62)
      const y = Y0 + j * STEP + (edge ? 0 : (R() - 0.5) * STEP * 0.62)
      P.push({ x, y, h: heightAt(x, y) })
    }
  }
  const pos = [], col = []
  const tri = (a, b, c) => {
    const avg = (a.h + b.h + c.h) / 3
    colorAt(avg, tmp)
    tmp.multiplyScalar(0.965 + R() * 0.07)                                   // 면마다 아주 조금 다른 밝기 → 폴리곤 느낌
    const ex = ((a.x + b.x + c.x) / 3 - 400) / 500, ey = ((a.y + b.y + c.y) / 3 - 200) / 285
    const alpha = 1 - smooth(0.58, 0.97, Math.hypot(ex, ey))                  // 가장자리는 투명하게 사라져서 배경(페이지 색)에 자연스럽게 이어짐
    for (const v of [a, b, c]) { pos.push(v.x - 400, v.h, v.y - 200); col.push(tmp.r, tmp.g, tmp.b, alpha) }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = P[j * (cols + 1) + i], b = P[j * (cols + 1) + i + 1], c = P[(j + 1) * (cols + 1) + i], d = P[(j + 1) * (cols + 1) + i + 1]
      if ((i + j) % 2) { tri(a, c, b); tri(b, c, d) } else { tri(a, c, d); tri(a, d, b) }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4))
  g.computeVertexNormals()
  return g
}
