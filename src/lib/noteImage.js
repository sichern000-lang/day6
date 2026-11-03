// 노트 카드를 그림 파일(PNG)로: 인스타그램에 올리기 좋은 4:5 세로 그림에 카드 한 장이 가운데 놓임
const W = 1080, H = 1350, BG = '#eef2ec', INK = '#1d2616'
const SERIF = '"Gowun Batang", "Instrument Serif", serif', SANS = '"Pretendard", sans-serif'

// 글자 폭에 맞춰 줄바꿈 (띄어쓰기가 없는 한글은 글자 단위로 끊음)
function wrap(g, text, maxW, maxLines = 99) {
  const lines = []
  for (const para of String(text ?? '').split('\n')) {
    let line = ''
    const tokens = para.includes(' ') ? para.split(/(\s+)/) : [...para]
    for (const tok of tokens) {
      if (g.measureText(line + tok).width > maxW && line) { lines.push(line.trimEnd()); line = tok.trimStart() } else line += tok
    }
    lines.push(line.trimEnd())
  }
  if (lines.length > maxLines) { const cut = lines.slice(0, maxLines); cut[maxLines - 1] = cut[maxLines - 1].replace(/.{0,2}$/, '…'); return cut }
  return lines
}
const loadImage = (url) => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = url })
const rounded = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r) }

// item: { kind: 'note'|'ask'|'word'|'photo', tone, label, title, body, date, rom, name, image }
export async function noteToBlob(item) {
  await Promise.all([document.fonts?.load(`40px ${SERIF}`), document.fonts?.load(`600 30px ${SANS}`)].filter(Boolean)).catch(() => {})
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d')
  g.fillStyle = BG; g.fillRect(0, 0, W, H)

  const CW = 760, X = (W - CW) / 2, pad = 54
  // 1) 카드 안의 내용을 먼저 줄바꿈해서 높이를 구함
  let photo = null
  g.textBaseline = 'alphabetic'
  if (item.kind === 'photo') photo = await loadImage(item.image)
  const lines = (font, text, maxLines) => { g.font = font; return wrap(g, text, CW - pad * 2, maxLines) }
  const title = item.kind === 'photo' ? [] : lines(`400 ${item.kind === 'word' ? 84 : 56}px ${SERIF}`, item.title, 4)
  const rom = item.kind === 'word' ? lines(`400 32px ${SANS}`, item.rom, 1) : []
  const name = item.kind === 'word' && item.name ? lines(`600 36px ${SANS}`, item.name, 3) : []
  const text = item.kind === 'photo' ? [] : lines(`400 ${item.kind === 'word' ? 34 : 38}px ${SERIF}`, item.body, item.kind === 'ask' ? 12 : 9)
  const photoH = photo ? Math.min(900, ((CW - pad * 2) * photo.height) / photo.width) : 0
  let ch = pad + 60 + (title.length ? title.length * 70 + 20 : 0) + (rom.length ? 54 : 0) + (name.length ? name.length * 50 + 14 : 0) + (text.length ? text.length * 56 + 20 : 0) + (photo ? photoH + 24 : 0) + 96 + pad / 2
  ch = Math.max(ch, 560)
  const Y = Math.round((H - ch) / 2) - 20

  // 2) 카드 그리기
  g.save(); g.translate(W / 2, Y + ch / 2); g.rotate(-0.025); g.translate(-W / 2, -(Y + ch / 2))
  g.shadowColor = 'rgba(36, 58, 46, .28)'; g.shadowBlur = 40; g.shadowOffsetY = 18
  g.fillStyle = item.kind === 'word' || item.kind === 'photo' ? '#fbfdfb' : item.tone ?? '#c9d8ee'
  rounded(g, X, Y, CW, ch, 6); g.fill()
  g.shadowColor = 'transparent'
  let y = Y + pad + 18
  g.fillStyle = INK; g.textAlign = 'center'
  g.font = `italic 400 36px ${SERIF}`; g.fillText(item.label ?? '', W / 2, y)
  g.strokeStyle = 'rgba(29, 38, 22, .55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X + pad, y + 22); g.lineTo(X + CW - pad, y + 22); g.stroke()
  y += 22 + 30
  g.textAlign = 'left'
  if (photo) { const x0 = X + pad, w = CW - pad * 2; g.fillStyle = '#eef2ec'; g.fillRect(x0, y, w, photoH); const k = Math.min(w / photo.width, photoH / photo.height); g.drawImage(photo, x0 + (w - photo.width * k) / 2, y + (photoH - photo.height * k) / 2, photo.width * k, photo.height * k); y += photoH + 24 }
  g.fillStyle = INK
  if (title.length) { g.font = `400 ${item.kind === 'word' ? 84 : 56}px ${SERIF}`; y += item.kind === 'word' ? 54 : 34; for (const l of title) { g.fillText(l, X + pad, y); y += item.kind === 'word' ? 90 : 70 } y -= item.kind === 'word' ? 20 : 4 }
  if (rom.length) { g.fillStyle = '#67776a'; g.font = `400 32px ${SANS}`; g.fillText(rom[0], X + pad, y + 8); y += 54; g.fillStyle = INK }
  if (name.length) { g.font = `600 36px ${SANS}`; for (const l of name) { g.fillText(l, X + pad, y + 18); y += 50 } y += 14 }
  if (text.length) {
    g.font = `400 ${item.kind === 'word' ? 34 : 38}px ${SERIF}`; y += 22
    for (const l of text) {
      if (item.kind === 'note') { g.strokeStyle = 'rgba(29, 38, 22, .2)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X + pad, y + 14); g.lineTo(X + CW - pad, y + 14); g.stroke() }
      g.fillStyle = INK; g.fillText(l, X + pad, y); y += 56
    }
  }
  g.strokeStyle = 'rgba(29, 38, 22, .35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X + pad, Y + ch - 70); g.lineTo(X + CW - pad, Y + ch - 70); g.stroke()
  g.fillStyle = INK; g.font = `400 28px ${SANS}`; g.fillText(`date : ${item.date ?? ''}`, X + pad, Y + ch - 28)
  g.restore()

  g.textAlign = 'center'; g.fillStyle = INK; g.font = `400 56px "Instrument Serif", ${SERIF}`; g.fillText('Jeju Story Archive', W / 2, H - 92)
  g.fillStyle = '#67776a'; g.font = `400 26px ${SANS}`; g.fillText(item.sub ?? '', W / 2, H - 50)
  return new Promise((res) => c.toBlob(res, 'image/png'))
}

// 공유(휴대폰은 공유 창 → 인스타그램 선택) 또는 저장
export async function shareBlob(blob, name, title) {
  const file = new File([blob], `${name}.png`, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title }); return 'shared' } catch { return 'cancel' } }
  saveBlob(blob, name); return 'saved'
}
export function saveBlob(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${name}.png`
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
