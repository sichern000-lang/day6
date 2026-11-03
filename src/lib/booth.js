import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Doodle, { DOODLES } from '../components/Doodle'
import { rng } from './rng'

// 포토부스: 사진 3컷을 한 장의 세로 띠로 만든다. 프레임 배경에는 랜딩의 두들을 무늬로 깔고, 스티커를 올린 뒤 옛 포토부스 같은 필터를 입힘.
export const STRIP = { w: 800, cell: 680, mx: 60, top: 60, gap: 40, bottom: 190 }
export const STRIP_H = STRIP.top + STRIP.cell * 3 + STRIP.gap * 2 + STRIP.bottom
export const cellY = (i) => STRIP.top + i * (STRIP.cell + STRIP.gap)

// 프레임 색: 흰색 → 연한 세이지(제주 들판) → 하늘색(제주 하늘) → 진한 남색(제주 바다)
export const FRAMES = [
  { id: 'white', color: '#fbfcfa', pat: '#1d2616', patAlpha: 0.22, text: '#1d2616', border: false },
  { id: 'field', color: '#c8d9bb', pat: '#2f4a2a', patAlpha: 0.32, text: '#1d2616', border: false },
  { id: 'sky', color: '#bcd8ec', pat: '#244a66', patAlpha: 0.3, text: '#1d2616', border: false },
  { id: 'sea', color: '#1f3556', pat: '#ffffff', patAlpha: 0.26, text: '#f4f8f6', border: false },
]
// 필터: 선명하지 않고 살짝 흐리고 바랜 듯 예쁘게 (채도↓, 검정은 들뜨게, 색 입힘, 번짐, 가장자리 어둡게, 필름 알갱이)
export const FILTERS = {
  soft: { sat: 0.82, fade: 12, contrast: 1.08, bright: 14, tint: [7, 2, -6], glow: 0.26, grain: 16, vig: 0.2 },
  sage: { sat: 0.78, fade: 12, contrast: 1.08, bright: 14, tint: [-8, 7, -2], glow: 0.26, grain: 16, vig: 0.2 },
  mono: { sat: 0, fade: 10, contrast: 1.16, bright: 12, tint: [-4, 0, 7], glow: 0.2, grain: 22, vig: 0.26 },
}

// ── 두들(SVG) → 그림 ──
const STYLE = "<style>.fill{fill:currentColor;stroke:none}.fill.soft{fill-opacity:.1}.paper-stroke{stroke:#f1f5f1}.paper-fill{fill:#f1f5f1;stroke:none}[class*='c-'],.snake{stroke:currentColor}</style>"
const imgCache = new Map()
function loadSvg(markup, size) {
  const svg = markup.replace(/<svg([^>]*)>/, `<svg$1 xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${STYLE}`)
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  return img.decode().then(() => img)
}
function doodleImage(variant, color, { cut = false, size = 300, paper = '#fbfcfa' } = {}) {
  const key = `${variant}|${color}|${cut}|${size}`
  if (!imgCache.has(key)) {
    let m = renderToStaticMarkup(createElement(Doodle, { variant, seed: variant, cut, paper }))
    m = m.replace('<svg ', `<svg style="color:${color}" `)
    imgCache.set(key, loadSvg(m, size))
  }
  return imgCache.get(key)
}
// 스티커: 첨부해 주신 진짜 스티커 같은 별(홀로그램)과 제주 스티커들 (src/assets/stickers/*.png — 흰 테두리까지 들어 있는 투명 PNG)
const files = import.meta.glob('../assets/stickers/*.png', { eager: true, query: '?url', import: 'default' })
const RANK = { star: 0, jeju: 1, bottle: 2 }
export const STICKERS = Object.entries(files)
  .map(([path, url]) => ({ id: path.split('/').pop().replace('.png', ''), url }))
  .sort((a, b) => RANK[a.id.split('-')[0]] - RANK[b.id.split('-')[0]] || a.id.localeCompare(b.id))
export const stickerImage = (id) => {
  const key = `sticker|${id}`
  if (!imgCache.has(key)) { const img = new Image(); img.src = STICKERS.find((s) => s.id === id).url; imgCache.set(key, img.decode().then(() => img)) }
  return imgCache.get(key)
}
// size 는 긴 쪽 길이 — 가로세로 비율은 그림 그대로
export const stickerBox = (im, size) => { const r = im.naturalWidth / im.naturalHeight; return r >= 1 ? { w: size, h: size / r } : { w: size * r, h: size } }
// 프레임 무늬: 랜딩의 두들 14종을 비스듬히 흩뿌림 (같은 자리에 늘 같은 모양)
const patternLayout = (() => {
  const r = rng('booth-pattern'), list = []
  for (let i = 0; i < 34; i++) list.push({ d: DOODLES[i % DOODLES.length], x: r() * STRIP.w, y: r() * STRIP_H, s: 150 + r() * 80, rot: (r() - 0.5) * 0.9 })
  return list
})()
export async function loadAssets(frame) {
  const [pat, stickers] = await Promise.all([
    Promise.all(DOODLES.map((d) => doodleImage(d, frame.pat))),
    Promise.all(STICKERS.map((s) => stickerImage(s.id))),
  ])
  return { pat: Object.fromEntries(DOODLES.map((d, i) => [d, pat[i]])), stickers: Object.fromEntries(STICKERS.map((s, i) => [s.id, stickers[i]])) }
}

// ── 필터 ──
function applyFilter(canvas, id) {
  const f = FILTERS[id] ?? FILTERS.soft, g = canvas.getContext('2d'), w = canvas.width, h = canvas.height
  const small = document.createElement('canvas'); small.width = Math.max(2, (w / 7) | 0); small.height = Math.max(2, (h / 7) | 0)
  small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height)
  g.save(); g.globalAlpha = f.glow; g.imageSmoothingQuality = 'high'; g.drawImage(small, 0, 0, w, h); g.restore()   // 몽글하게 번지는 느낌
  const img = g.getImageData(0, 0, w, h), d = img.data, cx = w / 2, cy = h / 2, invMd = 1 / Math.hypot(cx, cy)
  const br = f.bright ?? 0, [tr, tg, tb] = f.tint, sat = f.sat, con = f.contrast, k = f.fade / 255, fade = f.fade, grain = f.grain, vig = f.vig
  for (let y = 0, i = 0; y < h; y++) {
    const dy2 = (y - cy) * (y - cy)
    for (let x = 0; x < w; x++, i += 4) {
      let r = d[i], gg = d[i + 1], b = d[i + 2]
      const l = 0.299 * r + 0.587 * gg + 0.114 * b
      r = (l + (r - l) * sat - 128) * con + 128; gg = (l + (gg - l) * sat - 128) * con + 128; b = (l + (b - l) * sat - 128) * con + 128
      r = r * (1 - k) + fade + tr + br; gg = gg * (1 - k) + fade + tg + br; b = b * (1 - k) + fade + tb + br
      const dd = Math.sqrt((x - cx) * (x - cx) + dy2) * invMd
      let v = 1
      if (dd > 0.55) { const q = (dd - 0.55) / 0.45; v = 1 - vig * q * q }
      const n = ((Math.imul((i >> 2) ^ 0x9e3779b9, 2654435761) >>> 0) / 4294967296 - 0.5) * grain     // 필름 알갱이 (같은 자리에는 늘 같은 값이라 미리보기가 깜빡이지 않음)
      r = r * v + n; gg = gg * v + n; b = b * v + n
      d[i] = r < 0 ? 0 : r > 255 ? 255 : r; d[i + 1] = gg < 0 ? 0 : gg > 255 ? 255 : gg; d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b
    }
  }
  g.putImageData(img, 0, 0)
}

// ── 한 장으로 합치기 ──
// photos: 정사각형 canvas 3장, stickers: [{ kind, cell, x, y, size, rot }] (x, y 는 사진 안 좌표 0~680)
export function compose({ photos, stickers, frame, filter, scale = 1, assets, activeCell = -1 }) {
  const S = scale, W = Math.round(STRIP.w * S), H = Math.round(STRIP_H * S)
  const out = document.createElement('canvas'); out.width = W; out.height = H
  const g = out.getContext('2d')
  g.fillStyle = frame.color; g.fillRect(0, 0, W, H)
  g.save(); g.globalAlpha = frame.patAlpha                                                   // 두들 무늬
  for (const p of patternLayout) {
    g.save(); g.translate(p.x * S, p.y * S); g.rotate(p.rot)
    g.drawImage(assets.pat[p.d], (-p.s / 2) * S, (-p.s / 2) * S, p.s * S, p.s * S); g.restore()
  }
  g.restore()
  const cs = Math.round(STRIP.cell * S)
  photos.forEach((ph, i) => {
    const cell = document.createElement('canvas'); cell.width = cell.height = cs
    const c = cell.getContext('2d')
    c.drawImage(ph, 0, 0, cs, cs)
    for (const s of stickers.filter((x) => x.cell === i)) {                                  // 스티커는 필터 전에 올려서 사진과 같은 질감이 됨
      c.save(); c.translate(s.x * S, s.y * S); c.rotate(s.rot)
      const im = assets.stickers[s.kind], bx = stickerBox(im, s.size)
      c.drawImage(im, (-bx.w / 2) * S, (-bx.h / 2) * S, bx.w * S, bx.h * S); c.restore()
    }
    applyFilter(cell, filter)
    const x = STRIP.mx * S, y = cellY(i) * S, b = frame.border ? 8 * S : 0
    if (b) { g.fillStyle = '#fbfcfa'; g.fillRect(x - b, y - b, cs + b * 2, cs + b * 2) }
    g.drawImage(cell, x, y)
    if (i === activeCell) { g.save(); g.strokeStyle = '#ffffff'; g.setLineDash([14 * S, 10 * S]); g.lineWidth = 4 * S; g.strokeRect(x + 6 * S, y + 6 * S, cs - 12 * S, cs - 12 * S); g.restore() }
  })
  g.fillStyle = frame.text; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.font = `400 ${Math.round(66 * S)}px "Instrument Serif", "Gowun Batang", serif`
  g.fillText('Jeju Photo Booth', W / 2, (STRIP_H - 112) * S)
  g.globalAlpha = 0.7; g.font = `400 ${Math.round(26 * S)}px "Pretendard", sans-serif`
  g.fillText(`${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} · Jeju Story Archive`, W / 2, (STRIP_H - 56) * S)
  return out
}

// 화면(video/이미지)을 가운데 기준 정사각형으로 잘라 한 장의 canvas 로
export function squareFrom(source, w, h, mirror = false, size = STRIP.cell) {
  const c = document.createElement('canvas'); c.width = c.height = size
  const g = c.getContext('2d'), s = Math.min(w, h), sx = (w - s) / 2, sy = (h - s) / 2
  if (mirror) { g.translate(size, 0); g.scale(-1, 1) }
  g.drawImage(source, sx, sy, s, s, 0, 0, size, size)
  return c
}
