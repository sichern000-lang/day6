import { useCallback, useEffect, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { FILTERS, FRAMES, STICKERS, STRIP, STRIP_H, cellY, compose, loadAssets, squareFrom, stickerBox } from '../lib/booth'
import { shrinkToJpeg, uploadPhoto } from '../lib/photos'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 포토부스: 폰으로 제주 어디서든 3컷 사진 → 프레임·필터·스티커 → 세로 사진 띠로 저장·공유
export default function Booth() {
  const t = useT()
  const toast = useAppStore((s) => s.toast)
  const saveStory = useAppStore((s) => s.saveStory)
  const [noting, setNoting] = useState(false)
  const video = useRef(null), stream = useRef(null), preview = useRef(null), pick = useRef(null), fileInput = useRef(null)
  const [facing, setFacing] = useState('environment')
  const [cam, setCam] = useState('wait')                 // wait | on | denied
  const [mirror, setMirror] = useState(true)             // 셀피(앞 카메라·노트북 웹캠)만 거울처럼 반전, 뒤 카메라는 그대로
  const [count, setCount] = useState(0), [flash, setFlash] = useState(false), [taken, setTaken] = useState(0), [busy, setBusy] = useState(false)
  const [shots, setShots] = useState(null)               // 정사각형 사진 3장 (있으면 꾸미기 화면)
  const [frameId, setFrameId] = useState('field'), [filter, setFilter] = useState('soft')
  const [stickers, setStickers] = useState([]), [sel, setSel] = useState(null), [active, setActive] = useState(0)
  const [strokes, setStrokes] = useState([]), [pen, setPen] = useState(false), [penColor, setPenColor] = useState('#ffffff'), [penW, setPenW] = useState(10)
  const [stickerOpen, setStickerOpen] = useState(() => !window.matchMedia('(max-width: 760px)').matches)   // 모바일은 스티커 칸을 접어 둠
  const inking = useRef(null)
  const [assets, setAssets] = useState(null)
  const frame = FRAMES.find((f) => f.id === frameId)

  // ── 카메라 ──
  const stopCam = useCallback(() => { stream.current?.getTracks().forEach((x) => x.stop()); stream.current = null }, [])
  const startCam = useCallback(async (face) => {
    stopCam(); setCam('wait')
    if (!navigator.mediaDevices?.getUserMedia) return setCam('denied')
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: face }, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      setMirror(stream.current.getVideoTracks()[0]?.getSettings?.().facingMode !== 'environment')
      if (video.current) { video.current.srcObject = stream.current; await video.current.play() }
      setCam('on')
    } catch { setCam('denied') }
  }, [stopCam])
  useEffect(() => { if (!shots) startCam(facing); return stopCam }, [shots, facing, startCam, stopCam])

  async function shoot() {
    if (busy || cam !== 'on') return
    setBusy(true); setTaken(0)
    const out = []
    for (let i = 0; i < 3; i++) {
      for (const n of [3, 2, 1]) { setCount(n); await sleep(900) }
      setCount(0); setFlash(true); setTimeout(() => setFlash(false), 160)
      const v = video.current
      out.push(squareFrom(v, v.videoWidth, v.videoHeight, mirror))   // 미리보기와 같은 방향으로 저장
      setTaken(i + 1); await sleep(650)
    }
    setBusy(false); finishShots(out)
  }
  async function onFiles(e) {                                           // 카메라가 없을 때(또는 폰 카메라 앱으로) 사진 고르기
    const files = [...(e.target.files ?? [])].slice(0, 3)
    e.target.value = ''
    if (!files.length) return
    const out = []
    for (let i = 0; i < 3; i++) { const bmp = await createImageBitmap(files[i % files.length]); out.push(squareFrom(bmp, bmp.width, bmp.height)) }
    finishShots(out)
  }
  function finishShots(out) { stopCam(); setShots(out); setStickers([]); setStrokes([]); setPen(false); setSel(null); setActive(0); setTaken(0) }
  const retake = () => { setShots(null); setStickers([]); setStrokes([]); setPen(false); setSel(null) }

  // ── 프레임 무늬·스티커 그림 준비 ──
  useEffect(() => {
    let on = true
    loadAssets(frame).then((a) => { if (on) setAssets(a) })
    return () => { on = false }
  }, [frame])

  // ── 미리보기 (필터까지 입힌 모습) ──
  useEffect(() => {
    if (!shots || !assets) return
    const id = requestAnimationFrame(() => {
      const c = compose({ photos: shots, stickers, strokes, frame, filter, scale: 0.5, assets, activeCell: pen || stickers.length === 0 ? -1 : active })
      const el = preview.current; if (!el) return
      el.width = c.width; el.height = c.height
      const g = el.getContext('2d'); g.drawImage(c, 0, 0)
      const s = stickers.find((x) => x.id === sel)
      if (s) {                                                          // 고른 스티커 둘레 표시
        g.save(); g.translate((STRIP.mx + s.x) * 0.5, (cellY(s.cell) + s.y) * 0.5); g.rotate(s.rot)
        const bx = stickerBox(assets.stickers[s.kind], s.size)
        g.strokeStyle = '#1d2616'; g.lineWidth = 2; g.setLineDash([6, 5]); g.strokeRect((-bx.w * 0.5) / 2 - 4, (-bx.h * 0.5) / 2 - 4, bx.w * 0.5 + 8, bx.h * 0.5 + 8); g.restore()
      }
    })
    return () => cancelAnimationFrame(id)
  }, [shots, assets, stickers, strokes, pen, frame, filter, sel, active])

  // ── 스티커 만지기: 누르면 고르고, 끌면 옮김 ──
  const toStrip = (e) => { const r = preview.current.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * STRIP.w, y: ((e.clientY - r.top) / r.height) * STRIP_H } }
  const cellAt = (p) => [0, 1, 2].find((k) => p.y >= cellY(k) - STRIP.gap / 2 && p.y <= cellY(k) + STRIP.cell + STRIP.gap / 2)
  const inCell = (p, i) => [Math.max(0, Math.min(STRIP.cell, p.x - STRIP.mx)), Math.max(0, Math.min(STRIP.cell, p.y - cellY(i)))]
  const onDown = (e) => {
    const p = toStrip(e)
    if (pen) {                                                         // 펜: 눌러서 그리기 (사진 칸 안에서만)
      const i = cellAt(p)
      if (i === undefined) return
      const st = { id: `${Date.now()}${Math.random()}`, cell: i, color: penColor, w: penW, pts: [inCell(p, i)] }
      inking.current = st.id; setActive(i); setStrokes((all) => [...all, st]); preview.current.setPointerCapture(e.pointerId)
      return
    }
    const hit = [...stickers].reverse().find((s) => {
      const bx = stickerBox(assets.stickers[s.kind], s.size), dx = p.x - (STRIP.mx + s.x), dy = p.y - (cellY(s.cell) + s.y), c = Math.cos(-s.rot), sn = Math.sin(-s.rot)
      return Math.abs(dx * c - dy * sn) < bx.w / 2 && Math.abs(dx * sn + dy * c) < bx.h / 2        // 회전한 스티커 안쪽인지
    })
    if (hit) { setSel(hit.id); pick.current = { id: hit.id, dx: STRIP.mx + hit.x - p.x, dy: cellY(hit.cell) + hit.y - p.y }; preview.current.setPointerCapture(e.pointerId) }
    else {
      setSel(null)
      const i = [0, 1, 2].find((k) => p.y >= cellY(k) - STRIP.gap / 2 && p.y <= cellY(k) + STRIP.cell + STRIP.gap / 2)
      if (i !== undefined) setActive(i)
    }
  }
  const onMove = (e) => {
    if (inking.current) {
      const p = toStrip(e), id = inking.current
      setStrokes((all) => all.map((s) => (s.id === id ? { ...s, pts: [...s.pts, inCell(p, s.cell)] } : s)))
      return
    }
    if (!pick.current) return
    const p = toStrip(e), { id, dx, dy } = pick.current
    setStickers((all) => all.map((s) => (s.id === id ? { ...s, x: Math.max(0, Math.min(STRIP.cell, p.x + dx - STRIP.mx)), y: Math.max(0, Math.min(STRIP.cell, p.y + dy - cellY(s.cell))) } : s)))
  }
  const onUp = () => { pick.current = null; inking.current = null }
  const addSticker = (kind) => {
    const s = { id: `${Date.now()}${Math.random()}`, kind, cell: active, x: STRIP.cell / 2 + (Math.random() - 0.5) * 140, y: STRIP.cell / 2 + (Math.random() - 0.5) * 140, size: kind.startsWith('star') ? 150 : 230, rot: (Math.random() - 0.5) * 0.4 }
    setStickers((all) => [...all, s]); setSel(s.id)
  }
  const tweak = (fn) => setStickers((all) => all.map((s) => (s.id === sel ? fn(s) : s)))
  const removeSel = () => { setStickers((all) => all.filter((s) => s.id !== sel)); setSel(null) }

  // ── 저장·공유 ──
  async function finalBlob() {
    const c = compose({ photos: shots, stickers, strokes, frame, filter, scale: 1, assets })
    return new Promise((res) => c.toBlob(res, 'image/png'))
  }
  async function save() {
    const blob = await finalBlob(), a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'jeju-photo-booth.png'; document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  }
  async function share() {
    const blob = await finalBlob(), file = new File([blob], 'jeju-photo-booth.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Jeju Photo Booth' }) } catch { /* 공유 창을 닫은 경우 */ } }
    else { await save(); toast(t('booth.saved')) }
  }

  // 내 노트에 담기: 기록용이라 작게 줄여서 올림 (계정에 저장 → 어느 기기에서나 보임)
  async function toNote() {
    if (noting) return
    setNoting(true)
    try {
      const jpg = await shrinkToJpeg(compose({ photos: shots, stickers, strokes, frame, filter, scale: 1, assets }), 560)
      const url = await uploadPhoto(jpg)
      const ok = await saveStory({ id: `photo:${Date.now()}`, title: 'Photo booth', image: url }, true)
      if (ok) toast(t('booth.noted'))
    } catch (e) { toast(e.message, 'error') }
    setNoting(false)
  }

  const selected = stickers.find((s) => s.id === sel)
  return (
    <>
      <PageHeader center title="Photo Booth" subtitle={t('booth.sub')} />
      {!shots ? (
        <div className="booth-cam">
          <div className="booth-view">
            <video ref={video} playsInline muted autoPlay className={mirror ? 'mirror' : ''} />
            {cam !== 'on' && (
              <div className="booth-msg">
                <p>{cam === 'wait' ? t('booth.wait') : t('booth.denied')}</p>
              </div>
            )}
            {count > 0 && <div className="booth-count" key={`${taken}-${count}`}>{count}</div>}
            {flash && <div className="booth-flash" />}
            <div className="booth-dots" aria-label={`${taken} / 3`}>{[1, 2, 3].map((n) => <i key={n} className={taken >= n ? 'on' : ''} />)}</div>
          </div>
          <div className="booth-bar">
            <button className="booth-side" onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))} disabled={busy} aria-label={t('booth.flip')} title={t('booth.flip')}>
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 8h12l-3-3M20 16H8l3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="booth-shutter" onClick={shoot} disabled={busy || cam !== 'on'} aria-label={t('booth.start')}><i /></button>
            <button className="booth-side" onClick={() => fileInput.current?.click()} disabled={busy} aria-label={t('booth.upload')} title={t('booth.upload')}>
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="m4 16 5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
            </button>
            <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={onFiles} />
          </div>
          <p className="hint center-text">{t('booth.hint3')}</p>
        </div>
      ) : (
        <div className="booth-edit">
          <canvas ref={preview} className="booth-strip" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
          <div className="booth-panel">
            <section><b>{t('booth.frame')}</b>
              <div className="swatches">{FRAMES.map((f) => (
                <button key={f.id} className={frameId === f.id ? 'on' : ''} style={{ background: f.color }} onClick={() => setFrameId(f.id)} aria-label={t(`booth.f.${f.id}`)} title={t(`booth.f.${f.id}`)} />
              ))}</div>
            </section>
            <section><b>{t('booth.filter')}</b>
              <div className="chips">{Object.keys(FILTERS).map((k) => <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{t(`booth.flt.${k}`)}</button>)}</div>
            </section>
            <section><b>{t('booth.pen')}</b>
              <div className="chips">
                <button className={pen ? 'on' : ''} aria-pressed={pen} onClick={() => { setPen((v) => !v); setSel(null) }}>✎ {t('booth.pen')}</button>
                {pen && <><button onClick={() => setStrokes((a) => a.slice(0, -1))} disabled={!strokes.length}>{t('booth.undo')}</button><button onClick={() => setStrokes([])} disabled={!strokes.length}>{t('booth.clear')}</button></>}
              </div>
              {pen && (
                <>
                  <div className="pen-tools">
                    <div className="swatches">{['#ffffff', '#1d2616', '#2f6fb5', '#e0657f'].map((c) => (
                      <button key={c} className={penColor === c ? 'on' : ''} style={{ background: c }} onClick={() => setPenColor(c)} aria-label={c} />
                    ))}</div>
                    <div className="pen-sizes">{[6, 10, 18].map((w) => (
                      <button key={w} className={penW === w ? 'on' : ''} onClick={() => setPenW(w)} aria-label={`${w}`}><i style={{ width: w + 4, height: w + 4 }} /></button>
                    ))}</div>
                  </div>
                  <p className="hint">{t('booth.penHint')}</p>
                </>
              )}
            </section>
            <section><button className="sticker-head" aria-expanded={stickerOpen} onClick={() => setStickerOpen((o) => !o)}><b>{t('booth.stickers')}</b><span aria-hidden="true">{stickerOpen ? '−' : '＋'}</span></button>
              {stickerOpen && <div className="sticker-tray">{STICKERS.map((s) => <button key={s.id} onClick={() => addSticker(s.id)} aria-label={s.id}><img src={s.url} alt="" loading="lazy" /></button>)}</div>}
              {stickerOpen && <p className="hint">{t('booth.stickerHint')}</p>}
              {selected && (
                <div className="chips sticker-ctl">
                  <button onClick={() => tweak((s) => ({ ...s, size: Math.max(70, s.size * 0.85) }))}>−</button>
                  <button onClick={() => tweak((s) => ({ ...s, size: Math.min(460, s.size * 1.18) }))}>＋</button>
                  <button onClick={() => tweak((s) => ({ ...s, rot: s.rot + 0.26 }))}>↻</button>
                  <button onClick={removeSel}>{t('booth.remove')}</button>
                </div>
              )}
            </section>
            <div className="modal-actions">
              <button className="btn dark" onClick={share}>{t('booth.share')}</button>
              <button className="btn ghost" onClick={toNote} disabled={noting}>{noting ? t('booth.noting') : t('booth.toNote')}</button>
              <button className="btn ghost" onClick={save}>{t('booth.save')}</button>
              <button className="btn ghost" onClick={retake}>{t('booth.retake')}</button>
            </div>
            <p className="hint">{t('island.shareHint')}</p>
          </div>
        </div>
      )}
    </>
  )
}
